"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDisplayName, getPlayerId, setDisplayName } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const [name,setName] = useState("");
  const [playerId,setPlayerId] = useState("");

  useEffect(() => {
    setName(getDisplayName());
    setPlayerId(getPlayerId());
  }, []);

  function save() {
    setDisplayName(name.trim() || "Player");
    alert("Saved.");
  }

  return (
    <main className="page">
      <Link href="/">← Home</Link>
      <h1>Player Profile</h1>
      <section className="card">
        <p className="small">
          No login required. This device gets a private player ID saved in the browser.
        </p>
        <div className="small">Player ID: {playerId}</div>
      </section>
      <section className="grid">
        <input placeholder="Display name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={save}>Save Display Name</button>
        <Link className="button-card gold" href="/leagues">Go to Leagues</Link>
      </section>
    </main>
  );
}