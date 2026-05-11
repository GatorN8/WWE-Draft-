export const STARTING_BANK = 90000000;
export const TKO_FALLBACK_PRICE = 186.79;

export function money(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

export function stock(n) {
  return Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function makeJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function salaryFromRating(row) {
  const r = row.rating || 70;
  const role = row.role || "Wrestler";
  if (role === "Legend") return r >= 97 ? 35000000 : r >= 94 ? 24000000 : r >= 90 ? 16000000 : 9000000;
  if (["Commentator","Executive","Authority Figure"].includes(role)) return r >= 94 ? 8000000 : r >= 88 ? 5000000 : r >= 82 ? 3000000 : 1500000;
  if (role === "Manager") return r >= 94 ? 7500000 : r >= 85 ? 4000000 : 1750000;
  if (["Ring Announcer","Interviewer"].includes(role)) return r >= 82 ? 1500000 : 900000;
  if (r >= 96) return 30000000;
  if (r >= 93) return 22000000;
  if (r >= 90) return 16000000;
  if (r >= 86) return 10000000;
  if (r >= 82) return 6500000;
  if (r >= 78) return 3500000;
  if (r >= 72) return 1500000;
  return 750000;
}

export function weeklyValue(row) {
  const r = row.rating || 70;
  if (row.is_champion) return Math.floor((r >= 95 ? 5000000 : r >= 90 ? 3500000 : 2200000) * 1.25);
  if (row.role === "Legend") return r >= 97 ? 8500000 : r >= 94 ? 6000000 : r >= 90 ? 3500000 : 1800000;
  if (row.role === "Commentator") return Math.floor(salaryFromRating(row) * .24);
  if (["Executive","Authority Figure"].includes(row.role)) return Math.floor(salaryFromRating(row) * .22);
  if (row.role === "Manager") return Math.floor(salaryFromRating(row) * .20);
  if (["Ring Announcer","Interviewer"].includes(row.role)) return Math.floor(salaryFromRating(row) * .18);
  if (r >= 96) return 4500000;
  if (r >= 93) return 3500000;
  if (r >= 90) return 2600000;
  if (r >= 86) return 1900000;
  if (r >= 82) return 1250000;
  if (r >= 78) return 800000;
  if (r >= 72) return 450000;
  return 200000;
}

export function etShowInfo(brand) {
  const meta = brand === "Raw"
    ? { day: 1, hour: 20, label: "Monday Night Raw" }
    : { day: 5, hour: 20, label: "Friday Night SmackDown" };

  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  const dowMap = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  const nowMs = Date.UTC(Number(parts.year), Number(parts.month)-1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  let daysUntil = (meta.day - dowMap[parts.weekday] + 7) % 7;
  if (daysUntil === 0 && Number(parts.hour) >= meta.hour) daysUntil = 7;

  const showMs = Date.UTC(Number(parts.year), Number(parts.month)-1, Number(parts.day)+daysUntil, meta.hour, 0);
  const deadlineMs = showMs - (4*60*60*1000);
  const key = new Date(showMs).toISOString().slice(0,10);

  return {
    brand,
    label: meta.label,
    show_key: key,
    show_day: key,
    allowed: nowMs < deadlineMs,
    deadline_label: new Date(deadlineMs).toISOString().slice(0,10) + " 4:00 PM ET"
  };
}

export function leagueMenu(id) {
  return [
    ["League", `/leagues/${id}`],
    ["Draft", `/leagues/${id}/draft`],
    ["Roster", `/leagues/${id}/roster`],
    ["Weekly", `/leagues/${id}/weekly`],
    ["Scoreboard", `/leagues/${id}/scoreboard`],
    ["Income", `/leagues/${id}/income`],
    ["TKO", `/leagues/${id}/stock`],
    ["Trades", `/leagues/${id}/trades`],
    ["Waivers", `/leagues/${id}/waivers`],
    ["Champions", `/leagues/${id}/champions`],
    ["News", `/leagues/${id}/news`]
  ];
}