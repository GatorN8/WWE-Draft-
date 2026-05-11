"use client";
import { useState } from "react";
import { LeagueMenu, PlayerBanner, AppHeader } from "../../../../lib/ui";

export default function News({ params }) {
 const [sources,setSources] = useState([]);
 const [loading,setLoading] = useState(false);

 async function checkSources() {
   setLoading(true);
   const data = await fetch("/api/source-preview").then(r=>r.json()).catch(()=>({results:[]}));
   setSources(data.results || []);
   setLoading(false);
 }

 const quickReads=[
  ["Official Results", "Start with WWE.com for match results, champions, and official show notes."],
  ["Major Recap", "Use CBS Sports for cleaner recaps of big moments and PLE coverage."],
  ["Deep Recap", "Use Wrestling Inc for detailed Raw/SmackDown segment notes."],
  ["Rumor Check", "Use Ringside News as context, not final scoring proof."],
  ["Roster/Ratings", "Use WWE Superstars, SmackDown Hotel, and 2K ratings for roster value."],
  ["Stock", "Use Yahoo Finance/TKO for business-side bonuses."]
 ];

 const sourcesList=[
  ["WWE.com","Official results, show pages, champions, and roster source."],
  ["WWE Superstars","Official roster/champion reference."],
  ["CBS Sports WWE","Major news, results, recaps, and coverage."],
  ["The SmackDown Hotel","Roster organization and WWE game-style info."],
  ["WWE 2K ratings","Ratings reference for draft values."],
  ["Wrestling Inc","Detailed recaps and show coverage."],
  ["Ringside News","Rumors and storyline context."],
  ["Yahoo Finance TKO","TKO stock tracking."]
 ];

 return <main className="page">
  <PlayerBanner />
  <LeagueMenu id={params.leagueId}/>
  <AppHeader eyebrow="Commissioner hub" title="News & Rumors">Quick-read source panel for weekly scoring, champions, momentum, and storyline context.</AppHeader>
  <section className="grid-3">{quickReads.map(q => <div className="news-item" key={q[0]}><strong>{q[0]}</strong><p className="small">{q[1]}</p></div>)}</section>
  <section className="card" style={{marginTop:16}}>
    <strong>Live Source Check</strong>
    <p className="small">Checks whether source pages are reachable and pulls page titles. Scoring should still be commissioner-reviewed before points finalize.</p>
    <button onClick={checkSources}>{loading ? "Checking..." : "Check Live Sources"}</button>
  </section>
  {sources.length > 0 && <section className="list">{sources.map(s => <div className="row" key={s.name}><strong>{s.name}</strong><div className="small">{s.ok ? "Reachable" : "Issue"} · Status: {s.status}</div><div className="small">{s.title}</div></div>)}</section>}
  <div className="section-title"><h2>Source List</h2><span className="badge">{sourcesList.length}</span></div>
  <section className="list">{sourcesList.map(s=><div className="row" key={s[0]}><strong>{s[0]}</strong><div className="small">{s[1]}</div></div>)}</section>
 </main>;
}