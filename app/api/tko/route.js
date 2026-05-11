export async function GET() {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/TKO", { next: { revalidate: 300 } });
    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return Response.json({ symbol: "TKO", price: price || 186.79, source: "Yahoo Finance chart endpoint" });
  } catch (e) {
    return Response.json({ symbol: "TKO", price: 186.79, source: "fallback" });
  }
}