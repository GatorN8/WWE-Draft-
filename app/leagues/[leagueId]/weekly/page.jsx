"use client";
import { PlayerBanner } from "../../../../lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer, supabase } from "../../../../lib/supabaseClient";
import { etShowInfo, leagueMenu, money, weeklyValue } from "../../../../lib/game";

function Menu({ id }) {
  return <div className="menu"><strong>☰ Menu</strong><div className="menu-row"><Link href="/leagues">Leagues</Link>{leagueMenu(id).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>;
}

export default function WeeklyPage({ params }) {
  const [brand,setBrand] = useState("Raw");
  const [roster,setRoster] = useState([]);
  const [setup,setSetup] = useState(null);
  const [expectations,setExpectations] = useState({});
  const [member,setMember] = useState(null);
  const [budget,setBudget] = useState(brand === "Raw" ? 3500000 : 3000000);
  const [focus,setFocus] = useState("Balanced TV");
  const [msg,setMsg] = useState("");

  useEffect(() => { load(); }, [brand]);

  async function load() {
    const user = getPlayer();
    const mem = await supabase.from("league_members").select("*").eq("league_id", params.leagueId).eq("player_key", user.id).single();
    setMember(mem.data);

    const r = await supabase.from("rosters").select("*, talent(*)").eq("league_id", params.leagueId).eq("assigned_brand", brand);
    setRoster(r.data || []);

    const info = etShowInfo(brand);
    const s = await supabase.from("weekly_setups").select("*").eq("league_id", params.leagueId).eq("player_key", user.id).eq("brand", brand).eq("show_key", info.show_key).maybeSingle();
    setSetup(s.data || null);

    const e = await supabase.from("show_expectations").select("*").eq("league_id", params.leagueId).eq("player_key", user.id).eq("brand", brand).eq("show_key", info.show_key);
    const map = {};
    (e.data || []).forEach(x => map[x.roster_id] = x);
    setExpectations(map);

    setBudget(brand === "Raw" ? 3500000 : 3000000);
  }

  async function toggleExpected(rosterRow, checked) {
    const user = getPlayer();
    const info = etShowInfo(brand);
    if (!info.allowed) return setMsg("Expectation picks lock 4 hours before showtime ET.");
    if (setup?.status === "finalized") return setMsg("This show has already been finalized.");

    if (checked) {
      const role = document.getElementById(`role-${rosterRow.id}`)?.value || "Appearance";
      const confidence = Number(document.getElementById(`confidence-${rosterRow.id}`)?.value || 50);
      const { error } = await supabase.from("show_expectations").insert({
        league_id: params.leagueId,
        player_key: user.id,
        brand,
        show_key: info.show_key,
        roster_id: rosterRow.id,
        expected_role: role,
        confidence
      });
      if (error) return setMsg(error.message);
    } else {
      await supabase.from("show_expectations")
        .delete()
        .eq("league_id", params.leagueId)
        .eq("player_key", user.id)
        .eq("brand", brand)
        .eq("show_key", info.show_key)
        .eq("roster_id", rosterRow.id);
    }
    await load();
  }

  async function setupShow() {
    const user = getPlayer();
    const info = etShowInfo(brand);
    if (!info.allowed) return setMsg("Setup window closed. You must set up at least 4 hours before showtime ET.");
    if (setup) return setMsg("Already set up for this show week.");

    const expectedCount = Object.keys(expectations).length;
    const { error } = await supabase.from("weekly_setups").insert({
      league_id: params.leagueId,
      player_key: user.id,
      brand,
      show_key: info.show_key,
      setup_deadline: info.deadline_label,
      production_budget: Number(budget),
      focus,
      status: "setup"
    });
    if (error) return setMsg(error.message);

    await supabase.from("ledger").insert({
      league_id: params.leagueId,
      player_key: user.id,
      type:"earned",
      amount:0,
      note:`Set up ${brand}: ${focus}, ${expectedCount} expected talent, ${money(Number(budget))} budget`
    });
    setMsg(`${brand} set up with ${expectedCount} expected appearances.`);
    await load();
  }

  async function finalizeShow() {
    const user = getPlayer();
    if (!setup) return setMsg("Set up this show first to earn the weekly planning bonus.");
    if (setup.status === "finalized") return setMsg("Already finalized this week.");

    const expectedIds = new Set(Object.keys(expectations));
    const expectedRoster = roster.filter(r => expectedIds.has(r.id));

    const gross = roster.reduce((a,b) => a + weeklyValue(b.talent || {}), 0);
    const expectedBonus = expectedRoster.reduce((a,b) => a + Math.floor(weeklyValue(b.talent || {}) * 0.2), 0);
    const setupBonus = Math.floor(gross * 0.10);
    const focusBonus = focus === "Legend Appearance" ? 1500000 : ["PLE Build","Title Story"].includes(focus) ? 1000000 : ["Promo Heavy","Match Heavy"].includes(focus) ? 750000 : focus === "Budget Episode" ? 250000 : 500000;
    const net = gross + setupBonus + focusBonus + expectedBonus - Number(setup.production_budget);
    const stockBonus = Math.max(1, Math.floor((setupBonus + focusBonus + expectedBonus) / 1000000));

    await supabase.from("weekly_setups").update({
      status:"finalized",
      gross_income:gross,
      net_income:net,
      tko_bonus:stockBonus
    }).eq("id", setup.id);

    await supabase.from("league_members").update({
      cash: member.cash + net,
      score: member.score + Math.max(net,0),
      tko_shares: (member.tko_shares || 0) + stockBonus
    }).eq("id", member.id);

    await supabase.from("ledger").insert({
      league_id: params.leagueId,
      player_key: user.id,
      type: net >= 0 ? "earned" : "spent",
      amount: Math.abs(net),
      note:`${brand} weekly setup result: ${money(net)} net, ${expectedRoster.length} expected talent, +${stockBonus} TKO shares`
    });

    setMsg(`${brand} finalized: ${money(net)} net.`);
    await load();
  }

  const info = etShowInfo(brand);
  const expectedCount = Object.keys(expectations).length;

  return <main className="page"><PlayerBanner /><Menu id={params.leagueId}/><h1>Weekly Show Setup</h1>

    <section className="card">
      <strong>Optional side game</strong>
      <p className="small">
        Pick who you expect to be on the real show, choose a show focus, and set a production budget before the 4-hour deadline. Correct planning earns extra cash and TKO stock.
      </p>
    </section>

    <div className="two">
      <button className={brand==="Raw" ? "gold" : ""} onClick={() => setBrand("Raw")}>Raw</button>
      <button className={brand==="SmackDown" ? "gold" : ""} onClick={() => setBrand("SmackDown")}>SmackDown</button>
    </div>

    <section className="card" style={{marginTop:16}}>
      <strong>{info.label}</strong>
      <p className="small">Next show: {info.show_day}. Deadline: {info.deadline_label}. Status: {setup ? setup.status : info.allowed ? "Setup available" : "Window closed"}</p>
      <span className="badge">{expectedCount} expected</span>
      <span className="badge">Once weekly</span>
      <span className="badge">Locks 4 hours early</span>
    </section>

    <section className="grid">
      <label>Production budget</label>
      <input type="number" value={budget} onChange={e=>setBudget(e.target.value)} />
      <label>Show focus</label>
      <select value={focus} onChange={e=>setFocus(e.target.value)}>
        <option>Balanced TV</option>
        <option>Promo Heavy</option>
        <option>Match Heavy</option>
        <option>PLE Build</option>
        <option>Title Story</option>
        <option>Legend Appearance</option>
        <option>Budget Episode</option>
      </select>
      <button disabled={!!setup || !info.allowed} onClick={setupShow}>Lock Weekly Setup</button>
      <button disabled={!setup || setup.status === "finalized"} onClick={finalizeShow}>Finalize After Show Airs</button>
    </section>

    {msg && <p className="small">{msg}</p>}

    <h2>Expected Talent</h2>
    <section className="list">
      {roster.map(r => {
        const exp = expectations[r.id];
        return <div className="row" key={r.id}>
          <strong>{r.talent?.name}</strong>
          <div className="small">{r.talent?.role} · Weekly value: {money(weeklyValue(r.talent || {}))}</div>
          <div className="two" style={{marginTop:10}}>
            <select id={`role-${r.id}`} defaultValue={exp?.expected_role || "Appearance"}>
              <option>Appearance</option>
              <option>Promo</option>
              <option>Match</option>
              <option>Win</option>
              <option>Title Story</option>
              <option>Legend Tease</option>
            </select>
            <select id={`confidence-${r.id}`} defaultValue={exp?.confidence || 50}>
              <option value="25">Low confidence</option>
              <option value="50">Medium confidence</option>
              <option value="75">High confidence</option>
              <option value="100">Lock of the week</option>
            </select>
          </div>
          <button style={{marginTop:10}} className={exp ? "danger" : ""} disabled={!info.allowed || setup?.status === "finalized"} onClick={() => toggleExpected(r, !exp)}>
            {exp ? "Remove Expected Pick" : "Expect On Show"}
          </button>
        </div>;
      })}
    </section>
  </main>;
}