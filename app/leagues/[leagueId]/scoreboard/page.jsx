"use client";
import { PlayerBanner } from "../../../../lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { leagueMenu, money } from "../../../../lib/game";
function Menu({ id }) { return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>; }
export default function Scoreboard({ params }) {
  const [members,setMembers]=useState([]);
  useEffect(()=>{load()},[]);
  async function load(){ const {data}=await supabase.from("league_members").select("*").eq("league_id",params.leagueId).order("score",{ascending:false}); setMembers(data||[]); }
  return <main className="page"><PlayerBanner /><Menu id={params.leagueId}/><h1>Scoreboard</h1><section className="list">{members.map((m,i)=><div className="row" key={m.id}><strong>#{i+1} {m.display_name}</strong><div className="small">Score: {money(m.score)} · Cash: {money(m.cash)} · TKO: {m.tko_shares||0} shares</div></div>)}</section></main>
}