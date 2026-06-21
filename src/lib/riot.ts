import { createServerFn } from "@tanstack/react-start";
import { supabase } from "./supabase";

// This function runs strictly on your secure backend server
export const verifyRiotAccount = createServerFn({ method: "POST" })
  .validator((data: { riotId: string; tagline: string }) => data)
  .handler(async ({ data }) => {
    const { riotId, tagline } = data;

    try {
      // 1. FIRST CHECK: Does this Riot ID already exist in our profiles table?
      const { data: existingProfile, error: dbError } = await supabase
        .from("profiles")
        .select("id")
        .match({ 
          riot_id: riotId.trim(), 
          tagline: tagline.trim() 
        })
        .maybeSingle();

      if (existingProfile) {
        return { 
          success: false, 
          error: "This Riot ID is already linked to another Kabaoo account.", 
          puuid: null 
        };
      }

      // 2. SECOND CHECK: Talk to the official Riot Games API
      const apiKey = process.env.RIOT_API_KEY;
      if (!apiKey) {
        return { success: false, error: "Riot API Key is missing on the server.", puuid: null };
      }

      const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(riotId.trim())}/${encodeURIComponent(tagline.trim())}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Riot-Token": apiKey,
        },
      });

      if (response.status === 404) {
        return { success: false, error: "Riot ID not found. Please check your spelling.", puuid: null };
      }

      if (!response.ok) {
        return { success: false, error: "Failed to connect to Riot Games. Try again later.", puuid: null };
      }

      const responseData = await response.json();
      
      return { success: true, error: null, puuid: responseData.puuid as string };
    } catch (error) {
      return { success: false, error: "Internal server error connecting to Riot.", puuid: null };
    }
  });