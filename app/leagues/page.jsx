"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer, getDisplayName, setDisplayName, supabase } from "../../lib/supabaseClient";
import { STARTING_BANK, makeJoinCode, money } from "../../lib/game";

export default function LeaguesPage() {
  const [leagues,setLeagues] = useState([]);
  const [name,setName] = useState("");
  const [displayName,setLocalDisplayName] = useState("");
  const [joinCode,setJoinCode] = useState("");
  const [msg,setMsg] = useState("");

  useEffect(() => {
    const saved = getDisplayName();
    setLocalDisplayName(saved);
    load();
  }, []);

  function saveName() {
    const clean = displayName.trim() || "Player";
    setDisplayName(clean);
    setMsg("Display name saved.");
    load();
  }

  async function load() {
    if (!supabase) return setMsg("Supabase is not connected.");
    const player = getPlayer();
    if (!player.id) return;
    const { data, error } = await supabase
      .from("league_members")
      .select("league_id, leagues(*)")
      .eq("player_key", player.id);
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
      name: leagueName,
      mode,
      commissioner_key: player.id,
      join_code: makeJoinCode(),
      starting_bank: STARTING_BANK,
      draft_status: "not_started",
      season: "Royal Rumble Season"
    }).select().single();
    if (error) return setMsg(error.message);
    await supabase.from("league_members").insert({
      league_id: data.id,
      player_key: player.id,
      display_name: display,
      cash: STARTING_BANK,
      tko_shares: 0,
      score: 0,
      trades_remaining: 4,
      waivers_remaining: 1
    });
    setName("");
    await load();
  }

  async function joinLeague() {
    if (!supabase) return setMsg("Supabase is not connected.");
    const player = getPlayer();
    const display = displayName.trim() || getDisplayName() || "Player";
    setDisplayName(display);
    const { data, error } = await supabase.from("leagues").select("*").eq("join_code", joinCode.trim().toUpperCase()).single();
    if (error || !data) return setMsg("League not found.");
    const { error: memberError } = await supabase.from("league_members").insert({
      league_id: data.id,
      player_key: player.id,
      display_name: display,
      cash: data.starting_bank || STARTING_BANK,
      tko_shares: 0,
      score: 0,
      trades_remaining: 4,
      waivers_remaining: 1
    });
    if (memberError) return setMsg(memberError.message);
    setJoinCode("");
    await load();
  }

  return (
    <main className="page">
      <Link href="/">← Home</Link>
      <h1>Your Leagues</h1>

      <section className="card">
        <strong>No login needed</strong>
        <p className="small">Enter a display name. This browser/device becomes your player profile.</p>
      </section>

      <section className="grid">
        <input placeholder="Your display name" value={displayName} onChange={e=>setLocalDisplayName(e.target.value)} />
        <button onClick={saveName}>Save Display Name</button>
      </section>

      <section className="card" style={{marginTop:16}}>
        <strong>Starting Bank</strong>
        <div className="money">{money(STARTING_BANK)}</div>
      </section>

      <section className="grid">
        <input placeholder="League name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={() => createLeague("solo")}>Create One Player Mode</button>
        <button onClick={() => createLeague("multiplayer")}>Create Multiplayer League</button>
        <input placeholder="Join code" value={joinCode} onChange={e=>setJoinCode(e.target.value)} />
        <button onClick={joinLeague}>Join League</button>
      </section>

      {msg && <p className="small">{msg}</p>}

      <section className="list">
        {leagues.map(l => (
          <Link className="row" href={`/leagues/${l.id}`} key={l.id}>
            <strong>{l.name}</strong>
            <div className="small">{l.mode} · Join code: {l.join_code}</div>
            <span className="badge">Draft: {l.draft_status}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}