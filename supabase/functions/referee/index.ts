import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { match_id, developer_override_placement, finalize } = await req.json();

    if (!match_id) throw new Error("Missing match_id");

    // ==========================================
    // 1. HANDLE MANUAL PLACEMENT OVERRIDES
    // ==========================================
    if (developer_override_placement) {
      const { user_id, placement } = developer_override_placement;
      
      const { error } = await supabaseClient
        .from('participants')
        .update({ placement: placement })
        .eq('match_id', match_id)
        .eq('user_id', user_id);

      if (error) throw new Error("Failed to update participant placement.");

      return new Response(JSON.stringify({ success: true, message: "Placement recorded." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ==========================================
    // 2. FINALIZE MATCH & DISTRIBUTE PRIZE POOL
    // ==========================================
    if (finalize) {
      // A. Get the match data to know the format and total prize
      const { data: match, error: matchError } = await supabaseClient
        .from('matches')
        .select('*')
        .eq('id', match_id)
        .single();

      if (matchError || !match) throw new Error("Match not found.");
      if (match.status === 'completed') throw new Error("Match is already completed.");

      // B. Get all participants
      const { data: participants, error: partError } = await supabaseClient
        .from('participants')
        .select('*')
        .eq('match_id', match_id);

      if (partError || !participants) throw new Error("Could not load participants.");

      const totalPrize = match.prize_pool;
      let payouts: { user_id: string, amount: number }[] = [];

      // C. Calculate the splits based on the Tournament Format
      if (match.tournament_format === '1v1') {
        const winner = participants.find(p => p.placement === 1);
        if (!winner) throw new Error("No 1st place winner declared.");
        payouts.push({ user_id: winner.user_id, amount: totalPrize });
      } 
      else if (match.tournament_format === '2v2' || match.tournament_format === '5v5') {
        // Find everyone on the winning team (anyone given 1st place)
        const winners = participants.filter(p => p.placement === 1);
        if (winners.length === 0) throw new Error("No winners declared.");
        
        // Split the pot equally among the winning teammates
        const splitAmount = Math.floor(totalPrize / winners.length);
        winners.forEach(w => payouts.push({ user_id: w.user_id, amount: splitAmount }));
      } 
      else if (match.tournament_format === 'ffa') {
        // 10-Player Deathmatch (60/30/10 Split)
        const first = participants.find(p => p.placement === 1);
        const second = participants.find(p => p.placement === 2);
        const third = participants.find(p => p.placement === 3);
        
        if (first) payouts.push({ user_id: first.user_id, amount: Math.floor(totalPrize * 0.60) });
        if (second) payouts.push({ user_id: second.user_id, amount: Math.floor(totalPrize * 0.30) });
        if (third) payouts.push({ user_id: third.user_id, amount: Math.floor(totalPrize * 0.10) });
      }

      // D. Process the payouts securely
      for (const payout of payouts) {
        // 1. Add money to user's wallet
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('balance')
          .eq('id', payout.user_id)
          .single();

        if (profile) {
          await supabaseClient
            .from('profiles')
            .update({ balance: profile.balance + payout.amount })
            .eq('id', payout.user_id);
        }

        // 2. Record the exact payout amount in the participants table for history
        await supabaseClient
          .from('participants')
          .update({ payout_amount: payout.amount })
          .eq('match_id', match_id)
          .eq('user_id', payout.user_id);
      }

      // E. Close the match
      await supabaseClient
        .from('matches')
        .update({ status: 'completed' })
        .eq('id', match_id);

      return new Response(JSON.stringify({ success: true, message: "Prizes distributed successfully." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error("Invalid request to referee.");

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});