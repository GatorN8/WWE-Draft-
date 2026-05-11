import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="small">Live fantasy wrestling manager</div>
        <h1 style={{fontSize:38,lineHeight:1.02,margin:"10px 0"}}>WWE Fantasy League</h1>
        <p className="small">Draft Raw and SmackDown rosters, set weekly show expectations, track champions, manage cash, and compete through score, trades, waivers, and TKO stock.</p>
      </section>
      <section className="grid-2">
        <Link className="button-card gold" href="/leagues">Start Playing</Link>
        <Link className="button-card" href="/login">Edit Display Name</Link>
      </section>
      <section className="grid-3">
        <div className="card"><strong>Draft</strong><p className="small">Build Raw and SmackDown with stars, legends, managers, and staff.</p></div>
        <div className="card"><strong>Weekly Setup</strong><p className="small">Predict appearances before deadlines for cash and TKO bonuses.</p></div>
        <div className="card"><strong>Season Mode</strong><p className="small">Rosters lock until Big 4 PLE windows reset strategy.</p></div>
      </section>
    </main>
  );
}