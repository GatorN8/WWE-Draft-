const SOURCES = [
  ["WWE.com", "https://www.wwe.com/"],
  ["WWE Superstars", "https://www.wwe.com/superstars"],
  ["CBS Sports WWE", "https://www.cbssports.com/wwe/"],
  ["The SmackDown Hotel Roster", "https://www.thesmackdownhotel.com/roster/wwe/"],
  ["WWE 2K Ratings", "https://www.thesmackdownhotel.com/news/wwe2k26/wwe-2k26-overall-ratings-list-all-superstars-ranked-by-best-rating"],
  ["Wrestling Inc", "https://www.wrestlinginc.com/"],
  ["Ringside News", "https://www.ringsidenews.com/wwe-news/"],
  ["Yahoo Finance TKO", "https://finance.yahoo.com/quote/TKO/"]
];

function getTitle(html) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim().slice(0, 140) : "No title found";
}

export async function GET() {
  const results = await Promise.all(SOURCES.map(async ([name, url]) => {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 WWEFantasyBot/1.0" },
        next: { revalidate: 900 }
      });
      const text = await res.text();
      return {
        name,
        url,
        ok: res.ok,
        status: res.status,
        title: getTitle(text),
        checked_at: new Date().toISOString()
      };
    } catch (e) {
      return {
        name,
        url,
        ok: false,
        status: "fetch_failed",
        title: e.message,
        checked_at: new Date().toISOString()
      };
    }
  }));

  return Response.json({ results });
}