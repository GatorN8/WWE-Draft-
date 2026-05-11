"use client";
import { PlayerBanner } from "../../../../lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer, supabase } from "../../../../lib/supabaseClient";
import { leagueMenu, money, salaryFromRating, weeklyValue } from "../../../../lib/game";

function Menu({ id }) {
  return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>;
}

export default function DraftPage({ params }) {
  const [talent,setTalent] = useState([]);
  const [owned,setOwned] = useState({});
  const [member,setMember] = useState(null);
  const [role,setRole] = useState("All");
  const [brand,setBrand] = useState("All");
  const [msg,setMsg] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const user = getPlayer();
    const mem = await supabase.from("league_members").select("*").eq("league_id", params.leagueId).eq("player_key", user.id).single();
    setMember(mem.data);
    const t = await supabase.from("talent").select("*").order("rating", { ascending:false });
    setTalent(t.data || []);
    const r = await supabase.from("rosters").select("talent_id").eq("league_id", params.leagueId);
    const map = {};
    (r.data || []).forEach(x => map[x.talent_id] = true);
    setOwned(map);
  }

  async function draft(row) {
    const user = getPlayer();
    if (!member) return setMsg("Join this league first.");
    const assignedBrand = document.getElementById(`brand-${row.id}`).value;
    const cost = row.salary || salaryFromRating(row);
    if (member.cash < cost) return setMsg("Not enough cash.");
    const { error } = await supabase.from("rosters").insert({
      league_id: params.leagueId,
      player_key: user.id,
      talent_id: row.id,
      assigned_brand: assignedBrand,
      salary: cost
    });
    if (error) return setMsg(error.message);
    await supabase.from("draft_picks").insert({ league_id: params.leagueId, player_key: user.id, talent_id: row.id, assigned_brand: assignedBrand, salary: cost });
    await supabase.from("league_members").update({ cash: member.cash - cost }).eq("id", member.id);
    await supabase.from("ledger").insert({ league_id: params.leagueId, player_key: user.id, type: "spent", amount: cost, note: `Drafted ${row.name} to ${assignedBrand}` });
    setMsg(`Drafted ${row.name}.`);
    await load();
  }

  async function undraft(row) {
    const user = getPlayer();
    const roster = await supabase.from("rosters").select("*").eq("league_id", params.leagueId).eq("talent_id", row.id).eq("player_key", user.id).single();
    if (!roster.data) return setMsg("You can only undraft your own pick.");
    const refund = roster.data.salary;
    await supabase.from("rosters").delete().eq("id", roster.data.id);
    await supabase.from("league_members").update({ cash: member.cash + refund }).eq("id", member.id);
    await supabase.from("ledger").insert({ league_id: params.leagueId, player_key: user.id, type: "earned", amount: refund, note: `Undrafted ${row.name}` });
    setMsg(`Removed ${row.name} and refunded ${money(refund)}.`);
    await load();
  }

  const rows = talent.filter(t => (role === "All" || t.role === role) && (brand === "All" || t.brand === brand));
  const roles = ["All","Wrestler","Legend","Manager","Authority Figure","Commentator","Interviewer","Ring Announcer","Faction/Team"];
  const brands = ["All","Raw","SmackDown","NXT","WWE","Legend"];

  return (
    <main className="page">
      <PlayerBanner />
      <Menu id={params.leagueId} />
      <h1>Draft</h1>
      <section className="card">
        <strong>Available Cash</strong>
        <div className="money">{money(member?.cash || 0)}</div>
        <p className="small">Choose Raw or SmackDown when drafting each person. Draft locks after you mark it complete.</p>
      </section>

      <div className="two">
        <select value={role} onChange={e=>setRole(e.target.value)}>{roles.map(x=><option key={x}>{x}</option>)}</select>
        <select value={brand} onChange={e=>setBrand(e.target.value)}>{brands.map(x=><option key={x}>{x}</option>)}</select>
      </div>
      {msg && <p className="small">{msg}</p>}

      <section className="list">
        {rows.map(row => {
          const cost = row.salary || salaryFromRating(row);
          return <div className="row" key={row.id}>
            <strong>{row.name}</strong>
            <div className="small">{row.role} · {row.tier} · Listed: {row.brand} {row.is_champion ? `· 🏆 ${row.title}` : ""}</div>
            <div className="small">Rating: {row.rating} · Contract: {money(cost)} · Weekly value: {money(weeklyValue(row))}</div>
            {owned[row.id] ? <button className="danger" style={{marginTop:10}} onClick={() => undraft(row)}>Deselect / Undraft</button> : <>
              <select id={`brand-${row.id}`} style={{marginTop:10}}><option>Raw</option><option>SmackDown</option></select>
              <button disabled={(member?.cash || 0) < cost} style={{marginTop:10}} onClick={() => draft(row)}>{(member?.cash || 0) < cost ? "Not Enough Cash" : `Draft ${row.name}`}</button>
            </>}
          </div>;
        })}
      </section>
    </main>
  );
}