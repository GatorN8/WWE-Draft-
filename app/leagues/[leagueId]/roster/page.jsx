"use client";
import { PlayerBanner } from "../../../../lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { leagueMenu, money, weeklyValue } from "../../../../lib/game";

function Menu({ id }) {
  return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>;
}

export default function RosterPage({ params }) {
  const [rows,setRows] = useState([]);
  const [members,setMembers] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("rosters").select("*, talent(*)").eq("league_id", params.leagueId);
    const m = await supabase.from("league_members").select("*").eq("league_id", params.leagueId);
    const map = {};
    (m.data || []).forEach(x => map[x.player_key] = x.display_name);
    setMembers(map);
    setRows(data || []);
  }

  const raw = rows.filter(r => r.assigned_brand === "Raw");
  const sd = rows.filter(r => r.assigned_brand === "SmackDown");

  function Card({ title, list }) {
    return <><div className="card"><strong>{title}</strong><p className="small">{list.length} roster members</p></div>{list.map(r => <div className="row" key={r.id}><strong>{r.talent?.name}</strong><div className="small">{r.talent?.role} · {r.talent?.tier} · Owner: {members[r.player_key] || "Player"}</div><div className="small">Salary: {money(r.salary)} · Weekly value: {money(weeklyValue(r.talent || {}))}</div></div>)}</>;
  }

  return <main className="page"><PlayerBanner /><Menu id={params.leagueId}/><h1>Roster</h1><section className="list"><Card title="Raw" list={raw}/><Card title="SmackDown" list={sd}/></section></main>;
}