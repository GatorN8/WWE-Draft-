"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { leagueMenu, money } from "../../../lib/game";

function Menu({ id }) {
  return <div className="menu"><strong>☰ Menu</strong><div className="menu-row">
    <Link href="/leagues">Leagues</Link>
    {leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
  </div></div>;
}

export default function LeaguePage({ params }) {
  const [league,setLeague] = useState(null);
  const [members,setMembers] = useState([]);
  const [rosterCount,setRosterCount] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("leagues").select("*").eq("id", params.leagueId).single();
    setLeague(data);
    const m = await supabase.from("league_members").select("*").eq("league_id", params.leagueId);
    setMembers(m.data || []);
    const r = await supabase.from("rosters").select("id", { count: "exact" }).eq("league_id", params.leagueId);
    setRosterCount(r.count || 0);
  }

  async function updateDraft(status) {
    await supabase.from("leagues").update({ draft_status: status }).eq("id", params.leagueId);
    await load();
  }

  async function resetDraft() {
    if (!confirm("Reset this draft? This clears rosters, picks, weekly setups, and ledger for this league.")) return;
    await supabase.from("rosters").delete().eq("league_id", params.leagueId);
    await supabase.from("draft_picks").delete().eq("league_id", params.leagueId);
    await supabase.from("ledger").delete().eq("league_id", params.leagueId);
    await supabase.from("weekly_setups").delete().eq("league_id", params.leagueId);
    await supabase.from("leagues").update({ draft_status: "not_started" }).eq("id", params.leagueId);
    await load();
  }

  if (!league) return <main className="page"><h1>Loading...</h1></main>;

  return (
    <main className="page">
      <Menu id={params.leagueId} />
      <section className="card">
        <div className="small">{league.mode}</div>
        <h1>{league.name}</h1>
        <div className="small">Join code: {league.join_code}</div>
        <span className="badge">Season: {league.season}</span>
        <span className="badge">Draft: {league.draft_status}</span>
      </section>

      <section className="grid">
        {league.draft_status === "not_started" && <button onClick={() => updateDraft("in_progress")}>Start Draft</button>}
        {league.draft_status === "in_progress" && <>
          <Link className="button-card gold" href={`/leagues/${params.leagueId}/draft`}>Continue Draft</Link>
          <button onClick={() => updateDraft("complete")}>Lock Draft Until Next Big 4 PLE</button>
        </>}
        {league.draft_status === "complete" && <>
          <Link className="button-card" href={`/leagues/${params.leagueId}/weekly`}>Weekly Show Setup</Link>
          <Link className="button-card" href={`/leagues/${params.leagueId}/scoreboard`}>Scoreboard</Link>
          <Link className="button-card" href={`/leagues/${params.leagueId}/roster`}>Roster</Link>
        </>}
        <button className="danger" onClick={resetDraft}>Reset Draft</button>
      </section>

      <section className="list">
        <div className="row"><strong>Roster count</strong><div className="small">{rosterCount} drafted</div></div>
        {members.map(m => <div className="row" key={m.id}><strong>{m.display_name}</strong><div className="small">Cash: {money(m.cash)} · Score: {money(m.score)} · TKO: {m.tko_shares || 0}</div></div>)}
      </section>
    </main>
  );
}