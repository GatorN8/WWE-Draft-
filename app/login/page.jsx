"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDisplayName, getPlayerId, setDisplayName } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const [name,setName] = useState("");
  const [playerId,setPlayerId] = useState("");

  useEffect(() => { setName(getDisplayName()); setPlayerId(getPlayerId()); }, []);

  function save() {
    setDisplayName(name.trim() || "Player");
    alert("Display name saved.");
  }

  return (
    <main className="page">
      <Link href="/leagues">← Leagues</Link>
      <section className="hero">
        <div className="small">Player profile</div>
        <h1>Display Name</h1>
        <p className="small">This is the name your friends see in leagues, drafts, scoreboards, and rosters.</p>
      </section>
      <section className="grid">
        <input placeholder="Display name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={save}>Save Display Name</button>
        <div className="card"><div className="tiny">Device Player ID</div><div className="small">{playerId}</div></div>
        <Link className="button-card gold" href="/leagues">Back to Leagues</Link>
      </section>
    </main>
  );
}