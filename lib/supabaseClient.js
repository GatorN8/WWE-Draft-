import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = url && key ? createClient(url, key) : null;

export function getPlayerId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("wwe_fantasy_player_id");
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("wwe_fantasy_player_id", id);
  }
  return id;
}

export function getDisplayName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("wwe_fantasy_display_name") || "";
}

export function setDisplayName(name) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wwe_fantasy_display_name", name || "Player");
}

export function getPlayer() {
  return {
    id: getPlayerId(),
    name: getDisplayName()
  };
}