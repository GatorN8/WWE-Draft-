"use client";
import { PlayerBanner } from "../../../../lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer, supabase } from "../../../../lib/supabaseClient";
import { leagueMenu, money, stock, TKO_FALLBACK_PRICE } from "../../../../lib/game";
function Menu({ id }) { return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>; }
export default function StockPage({ params }) {
 const [member,setMember]=useState(null); const [price,setPrice]=useState(TKO_FALLBACK_PRICE); const [shares,setShares]=useState("");
 useEffect(()=>{load()},[]);
 async function load(){ const p=await fetch("/api/tko").then(r=>r.json()).catch(()=>({price:TKO_FALLBACK_PRICE})); setPrice(p.price||TKO_FALLBACK_PRICE); const user=getPlayer(); const {data}=await supabase.from("league_members").select("*").eq("league_id",params.leagueId).eq("user_id",user.id).single(); setMember(data); }
 async function cashOut(){ const count=Math.min(Number(shares)||0, member?.tko_shares||0); if(count<=0)return; const value=Math.floor(count*price); await supabase.from("league_members").update({tko_shares:(member.tko_shares||0)-count,cash:member.cash+value}).eq("id",member.id); await supabase.from("ledger").insert({league_id:params.leagueId,player_key:member.player_key,type:"earned",amount:value,note:`Cashed out ${count} TKO shares`}); setShares(""); await load(); }
 return <main className="page"><PlayerBanner /><Menu id={params.leagueId}/><h1>TKO Stock</h1><section className="grid"><div className="card"><strong>Tracked Price</strong><div className="money">${Number(price).toFixed(2)}</div></div><div className="card"><strong>Your Shares</strong><div className="money">{stock(member?.tko_shares||0)}</div></div><div className="card"><strong>Estimated Value</strong><div className="money">{money((member?.tko_shares||0)*price)}</div></div><div className="card"><strong>Cash Out</strong><input value={shares} onChange={e=>setShares(e.target.value)} placeholder="Shares"/><button onClick={cashOut}>Cash Out Shares</button></div></section></main>
}