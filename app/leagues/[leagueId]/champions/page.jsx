"use client";
import { PlayerBanner } from "../../../../lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { leagueMenu, money, salaryFromRating } from "../../../../lib/game";
function Menu({ id }) { return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>; }
export default function Champions({ params }) {
 const [rows,setRows]=useState([]);
 useEffect(()=>{load()},[]);
 async function load(){ const {data}=await supabase.from("talent").select("*").eq("is_champion",true).order("rating",{ascending:false}); setRows(data||[]); }
 return <main className="page"><PlayerBanner /><Menu id={params.leagueId}/><h1>Active Champions</h1><section className="card"><p className="small">Champion data is seeded from your current snapshot. Commissioner should update it when titles change.</p></section><section className="list">{rows.map(c=><div className="row" key={c.id}><strong>{c.name}</strong><div className="small">🏆 {c.title}</div><div className="small">{c.brand} · Rating {c.rating} · Contract {money(c.salary||salaryFromRating(c))}</div></div>)}</section></main>
}