import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="card">
        <div className="small">Live no-login version</div>
        <h1>WWE Fantasy League</h1>
        <p className="small">
          No email. No password. Enter a display name, create or join a league with a code, and play online with friends.
        </p>
      </section>
      <section className="grid">
        <Link className="button-card gold" href="/leagues">Start Playing</Link>
      </section>
    </main>
  );
}