"use client";
import Link from "next/link";
import { useState } from "react";
import { leagueMenu } from "../../../../lib/game";

function Menu({ id }) {
  return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>;
}

export default function News({ params }) {
 const [sources,setSources] = useState([]);
 const [loading,setLoading] = useState(false);

 async function checkSources() {
   setLoading(true);
   const data = await fetch("/api/source-preview").then(r=>r.json()).catch(()=>({results:[]}));
   setSources(data.results || []);
   setLoading(false);
 }

 const manual=[
  ["WWE.com","Official results, show pages, champions, and roster source."],
  ["WWE Superstars","Official roster/champion reference."],
  ["CBS Sports WWE","Major news, results, recaps, and coverage."],
  ["The SmackDown Hotel","Roster organization and WWE game-style info."],
  ["WWE 2K ratings","Ratings reference for draft values."],
  ["Wrestling Inc","Detailed recaps and show coverage."],
  ["Ringside News","Rumors and storyline context."],
  ["Yahoo Finance TKO","TKO stock tracking."]
 ];

 return <main className="page"><Menu id={params.leagueId}/><h1>News & Rumors Hub</h1>
  <section className="card">
    <strong>Live source check</strong>
    <p className="small">This checks whether the app can reach your sources and read page titles. Full automatic scoring still needs a commissioner review layer because websites do not provide clean fantasy scoring data.</p>
    <button onClick={checkSources}>{loading ? "Checking..." : "Check Live Sources"}</button>
  </section>

  {sources.length > 0 && <section className="list">
    {sources.map(s => <div className="row" key={s.name}>
      <strong>{s.name}</strong>
      <div className="small">{s.ok ? "Reachable" : "Issue"} · Status: {s.status}</div>
      <div className="small">{s.title}</div>
    </div>)}
  </section>}

  <h2>Commissioner resource list</h2>
  <section className="list">{manual.map(s=><div className="row" key={s[0]}><strong>{s[0]}</strong><div className="small">{s[1]}</div></div>)}</section>
 </main>;
}