"use client";
import Link from "next/link";
import { getDisplayName, getPlayerId } from "./supabaseClient";
import { leagueMenu } from "./game";

export function PlayerBanner() {
  const name = typeof window !== "undefined" ? (getDisplayName() || "Player") : "Player";
  const initials = name.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase() || "P";
  return (
    <div className="banner">
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div className="avatar">{initials}</div>
        <div><strong>{name}</strong><div className="tiny">Player profile saved on this device</div></div>
      </div>
      <Link className="badge" href="/login">Edit</Link>
    </div>
  );
}

export function LeagueMenu({ id }) {
  return (
    <div className="menu">
      <strong>☰ WWE Fantasy</strong>
      <div className="menu-row">
        <Link href="/leagues">Leagues</Link>
        {leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </div>
    </div>
  );
}

export function AppHeader({ eyebrow, title, children }) {
  return <section className="hero"><div className="small">{eyebrow}</div><h1 style={{margin:"8px 0 4px",fontSize:34,lineHeight:1.03}}>{title}</h1>{children && <div className="small">{children}</div>}</section>;
}