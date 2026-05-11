"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer, supabase } from "../../../../lib/supabaseClient";
import { leagueMenu, money } from "../../../../lib/game";
function Menu({ id }) { return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>; }
export default function Income({ params }) {
 const [rows,setRows]=useState([]);
 useEffect(()=>{load()},[]);
 async function load(){ const user=getPlayer(); const {data}=await supabase.from("ledger").select("*").eq("league_id",params.leagueId).eq("user_id",user.id).order("created_at",{ascending:false}); setRows(data||[]); }
 const spent=rows.filter(x=>x.type==="spent").reduce((a,b)=>a+Number(b.amount),0);
 const earned=rows.filter(x=>x.type==="earned").reduce((a,b)=>a+Number(b.amount),0);
 return <main className="page"><Menu id={params.leagueId}/><h1>Income Tracker</h1><section className="grid"><div className="card"><strong>Total Spent</strong><div className="money">{money(spent)}</div></div><div className="card"><strong>Total Earned</strong><div className="money">{money(earned)}</div></div><div className="card"><strong>Net</strong><div className="money">{money(earned-spent)}</div></div></section><section className="list">{rows.map(r=><div className="row" key={r.id}><strong>{r.note}</strong><div className="small">{r.type} · {money(r.amount)}</div></div>)}</section></main>
}