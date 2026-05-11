"use client";
import { PlayerBanner } from "../../../../lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer, supabase } from "../../../../lib/supabaseClient";
import { leagueMenu } from "../../../../lib/game";
function Menu({ id }) { return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>; }
export default function Trades({ params }) {
 const [member,setMember]=useState(null); const [msg,setMsg]=useState("");
 useEffect(()=>{load()},[]);
 async function load(){ const user=getPlayer(); const {data}=await supabase.from("league_members").select("*").eq("league_id",params.leagueId).eq("user_id",user.id).single(); setMember(data); }
 async function useTrade(){ if((member?.trades_remaining||0)<=0)return setMsg("No trades left until the next Big 4 PLE reset."); await supabase.from("league_members").update({trades_remaining:member.trades_remaining-1}).eq("id",member.id); setMsg("Used 1 trade."); await load(); }
 async function resetTrades(){ await supabase.from("league_members").update({trades_remaining:4,waivers_remaining:1}).eq("league_id",params.leagueId); setMsg("Trade window reset after Big 4 PLE."); await load(); }
 return <main className="page"><PlayerBanner /><Menu id={params.leagueId}/><h1>Trades</h1><section className="card"><strong>Trades Remaining</strong><div className="money">{member?.trades_remaining ?? 0} / 4</div><p className="small">Trades reset after Royal Rumble, WrestleMania, SummerSlam, and Survivor Series.</p></section><section className="grid"><button onClick={useTrade}>Use 1 Trade</button><button onClick={resetTrades}>Commissioner: Reset After Big 4 PLE</button></section>{msg&&<p className="small">{msg}</p>}</main>
}