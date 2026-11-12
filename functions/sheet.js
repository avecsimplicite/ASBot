// GET /sheet — relaie la feuille Google « Posts mensuels » (CSV publié)
// depuis asbot.pages.dev, pour que la page dans Zoom reste sur son propre domaine.

const SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnl8-YerEduI_wn45FLg36yEr2_na23Hrlk-txjYKuz5DxABxZcnuKxsNiqYNcMv3ulGEPveEKiAtP/pub?gid=665461249&single=true&output=csv";

export async function onRequestGet() {
  const upstream = await fetch(SHEET_CSV, { redirect: "follow" });
  if (!upstream.ok) {
    return new Response("Feuille indisponible (" + upstream.status + ")", { status: 502 });
  }
  return new Response(await upstream.text(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "cache-control": "public, max-age=60",
      "x-content-type-options": "nosniff",
    },
  });
}
