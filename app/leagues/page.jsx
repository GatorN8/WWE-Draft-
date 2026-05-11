"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer, getDisplayName, setDisplayName, supabase } from "../../lib/supabaseClient";
import { STARTING_BANK, makeJoinCode, money } from "../../lib/game";
import { PlayerBanner, AppHeader } from "../../lib/ui";

export default function LeaguesPage() {
  const [leagues,setLeagues] = useState([]);
  const [name,setName] = useState("");
  const [displayName,setLocalDisplayName] = useState("");
  const [joinCode,setJoinCode] = useState("");
  const [msg,setMsg] = useState("");

  useEffect(() => { setLocalDisplayName(getDisplayName()); load(); }, []);

  function saveName() { const clean = displayName.trim() || "Player"; setDisplayName(clean); setMsg("Display name saved."); load(); }

  async function load() {
    if (!supabase) return setMsg("Supabase is not connected.");
    const player = getPlayer();
    const { data, error } = await supabase.from("league_members").select("league_id, leagues(*)").eq("player_key", player.id);
    if (error) return setMsg(error.message);
    setLeagues((data || []).map(x => x.leagues).filter(Boolean));
  }

  async function createLeague(mode) {
    if (!supabase) return setMsg("Supabase is not connected.");
    const player = getPlayer();
    const display = displayName.trim() || getDisplayName() || "Player";
    setDisplayName(display);
    const leagueName = name.trim() || (mode === "solo" ? "One Player Mode" : "Multiplayer League");
    const { data, error } = await supabase.from("leagues").insert({
      name: leagueName, mode, commissioner_key: player.id, join_code: makeJoinCode(),
      starting_bank: STARTING_BANK, draft_status: "not_started", season: "Royal Rumble Season"
    }).select().single();
    if (error) return setMsg(error.message);
    await supabase.from("league_members").insert({
      league_id: data.id, player_key: player.id, display_name: display, cash: STARTING_BANK,
      tko_shares: 0, score: 0, trades_remaining: 4, waivers_remaining: 1
    });
    setName(""); await load();
  }

  async function joinLeague() {
    if (!supabase) return setMsg("Supabase is not connected.");
    const player = getPlayer();
    const display = displayName.trim() || getDisplayName() || "Player";
    setDisplayName(display);
    const { data, error } = await supabase.from("leagues").select("*").eq("join_code", joinCode.trim().toUpperCase()).single();
    if (error || !data) return setMsg("League not found.");
    const { error: memberError } = await supabase.from("league_members").insert({
      league_id: data.id, player_key: player.id, display_name: display, cash: data.starting_bank || STARTING_BANK,
      tko_shares: 0, score: 0, trades_remaining: 4, waivers_remaining: 1
    });
    if (memberError) return setMsg(memberError.message);
    setJoinCode(""); await load();
  }

  const solo = leagues.filter(l => l.mode === "solo");
  const multiplayer = leagues.filter(l => l.mode !== "solo");

  function LeagueCard({ l }) {
    return <Link className="row" href={`/leagues/${l.id}`}>
      <strong>{l.name}</strong>
      <div className="small">{l.mode === "solo" ? "One Player Mode" : "Multiplayer League"}</div>
      <div className="statline"><span className="badge">Code: {l.join_code}</span><span className="badge-dark">Draft: {l.draft_status}</span><span className="badge-dark">{l.season || "Royal Rumble Season"}</span></div>
    </Link>;
  }

  return (
    <main className="page">
      <PlayerBanner />
      <AppHeader eyebrow="League hub" title="Your Drafts">Manage solo tests, family leagues, and friend groups from one dashboard.</AppHeader>
      <section className="grid-2">
        <div className="card">
          <strong>Player Name</strong><p className="small">Appears in scoreboards and drafts.</p>
          <input placeholder="Your display name" value={displayName} onChange={e=>setLocalDisplayName(e.target.value)} />
          <button style={{marginTop:10}} onClick={saveName}>Save Name</button>
        </div>
        <div className="card">
          <strong>Create or Join</strong><p className="small">Starting bank: {money(STARTING_BANK)}</p>
          <input placeholder="New league name" value={name} onChange={e=>setName(e.target.value)} />
          <div className="two" style={{marginTop:10}}><button onClick={() => createLeague("solo")}>Solo</button><button onClick={() => createLeague("multiplayer")}>Multiplayer</button></div>
          <input style={{marginTop:10}} placeholder="Join code" value={joinCode} onChange={e=>setJoinCode(e.target.value)} />
          <button style={{marginTop:10}} onClick={joinLeague}>Join League</button>
        </div>
      </section>
      {msg && <p className="small">{msg}</p>}
      <div className="section-title"><h2>Multiplayer Leagues</h2><span className="badge">{multiplayer.length}</span></div>
      <section className="list">{multiplayer.length ? multiplayer.map(l => <LeagueCard l={l} key={l.id}/>) : <div className="card small">No multiplayer leagues yet.</div>}</section>
      <div className="section-title"><h2>One Player Drafts</h2><span className="badge">{solo.length}</span></div>
      <section className="list">{solo.length ? solo.map(l => <LeagueCard l={l} key={l.id}/>) : <div className="card small">No solo drafts yet.</div>}</section>
    </main>
  );
}