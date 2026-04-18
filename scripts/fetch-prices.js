const fs = require("fs");

const PRODUCTS = [
  { name: "Scarlet ex Booster Box (sv1S)", query: "pokemon+scarlet+ex+sv1S+booster+box+japanese+sealed" },
  { name: "Violet ex Booster Box (sv1V)", query: "pokemon+violet+ex+sv1V+booster+box+japanese+sealed" },
  { name: "Triplet Beat Booster Box (sv1a)", query: "pokemon+triplet+beat+sv1a+booster+box+japanese+sealed" },
  { name: "Clay Burst Booster Box (sv2D)", query: "pokemon+clay+burst+sv2D+booster+box+japanese+sealed" },
  { name: "Snow Hazard Booster Box (sv2P)", query: "pokemon+snow+hazard+sv2P+booster+box+japanese+sealed" },
  { name: "Pokemon Card 151 Booster Box (sv2a)", query: "pokemon+151+sv2a+booster+box+japanese+sealed" },
  { name: "Ruler of the Black Flame Booster Box (sv3)", query: "pokemon+ruler+black+flame+sv3+booster+box+japanese+sealed" },
  { name: "Raging Surf Booster Box (sv3a)", query: "pokemon+raging+surf+sv3a+booster+box+japanese+sealed" },
  { name: "Ancient Roar Booster Box (sv4K)", query: "pokemon+ancient+roar+sv4K+booster+box+japanese+sealed" },
  { name: "Future Flash Booster Box (sv4M)", query: "pokemon+future+flash+sv4M+booster+box+japanese+sealed" },
  { name: "Shiny Treasure ex Booster Box (sv4a)", query: "pokemon+shiny+treasure+ex+sv4a+booster+box+japanese+sealed" },
  { name: "Wild Force Booster Box (sv5K)", query: "pokemon+wild+force+sv5K+booster+box+japanese+sealed" },
  { name: "Crimson Haze Booster Box (sv5A)", query: "pokemon+crimson+haze+sv5a+booster+box+japanese+sealed" },
  { name: "Cyber Judge Booster Box (sv5M)", query: "pokemon+cyber+judge+sv5M+booster+box+japanese+sealed" },
  { name: "Mask of Change Booster Box (sv6)", query: "pokemon+mask+change+sv6+booster+box+japanese+sealed" },
  { name: "Night Wanderer Booster Box (sv6a)", query: "pokemon+night+wanderer+sv6a+booster+box+japanese+sealed" },
  { name: "Stellar Miracle Booster Box (sv7)", query: "pokemon+stellar+miracle+sv7+booster+box+japanese+sealed" },
  { name: "Paradise Dragona Booster Box (sv7a)", query: "pokemon+paradise+dragona+sv7a+booster+box+japanese+sealed" },
  { name: "Super Electric Breaker Booster Box (sv8)", query: "pokemon+super+electric+breaker+sv8+booster+box+japanese+sealed" },
  { name: "Terastal Festival ex Booster Box (sv8a)", query: "pokemon+terastal+festival+sv8a+booster+box+japanese+sealed" },
  { name: "Battle Partners Booster Box (sv9)", query: "pokemon+battle+partners+sv9+booster+box+japanese+sealed" },
  { name: "Heat Wave Arena Booster Box (sv9a)", query: "pokemon+heat+wave+arena+sv9a+booster+box+japanese+sealed" },
  { name: "Glory of Team Rocket Booster Box (sv10)", query: "pokemon+glory+team+rocket+sv10+booster+box+japanese+sealed" },
  { name: "Black Bolt Booster Box (sv11B)", query: "pokemon+black+bolt+sv11B+booster+box+japanese+sealed+-deluxe" },
  { name: "Black Bolt Deluxe Booster Box (sv11B)", query: "pokemon+black+bolt+sv11B+deluxe+booster+box+japanese+sealed" },
  { name: "White Flare Booster Box (sv11w)", query: "pokemon+white+flare+sv11W+booster+box+japanese+sealed+-deluxe" },
  { name: "White Flare Deluxe Booster Box (sv11w)", query: "pokemon+white+flare+sv11W+deluxe+booster+box+japanese+sealed" },
  { name: "Mega Brave Booster Box (m1L)", query: "pokemon+mega+brave+booster+box+japanese+sealed+-symphonia" },
  { name: "Mega Symphonia Booster Box (m1S)", query: "pokemon+mega+symphonia+booster+box+japanese+sealed+-brave" },
  { name: "Inferno X Booster Box (M2)", query: "pokemon+inferno+X+booster+box+japanese+sealed" },
  { name: "Mega Dream ex Booster Box (M2a)", query: "pokemon+mega+dream+ex+booster+box+japanese+sealed" },
  { name: "Munikis Zero Booster Box (M3)", query: "pokemon+munikis+zero+booster+box+japanese+sealed" },
  { name: "Ninja Spinner Booster Box (M4)", query: "pokemon+ninja+spinner+booster+box+japanese+sealed" }
];

// Rotate user agents to reduce blocking
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- Title filtering ----

const REJECT_WORDS = [
  // Multi-quantity
  "2 box", "3 box", "4 box", "5 box", "6 box", "10 box", "12 box",
  "2x", "3x", "4x", "5x", "6x", "10x", "x2", "x3", "x4", "x5",
  "set of 2", "set of 3", "set of 4", "pair of", "bundle of",
  "combo", "lot of", "lot ",
  // Not a box
  " pack", "packs", "single card", "singles",
  "case ", "case(", "sealed case",
  // Graded / opened
  "psa ", "psa-", "cgc ", "bgs ", "graded", "slab ",
  "no shrink", "without shrink", "unsealed", "opened",
  "resealed", "searched", "weighed",
  // Accessories
  "sleeves", "playmat", "binder", "card file", "deck box",
  "promo card", "promo only",
  // Other product types
  "etb", "elite trainer", "build & battle", "build and battle",
  "starter deck", "tin ", "collection box",
  "special box", "pokemon center set", "attache"
];

function isSealedBoosterBox(title) {
  const t = title.toLowerCase();
  // Must say "booster box" or "display box"
  if (!t.includes("booster box") && !t.includes("display box")) return false;
  // Reject bad keywords
  for (const w of REJECT_WORDS) {
    if (t.includes(w)) return false;
  }
  return true;
}

// ---- HTML parsing ----

function parseItems(html) {
  const items = [];
  const blocks = html.split(/class="s-item__wrapper/g);

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];

    // Title
    const tm = block.match(/class="s-item__title"[^>]*>(.*?)<\/(?:span|div|h3)/s);
    const title = tm ? tm[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
    if (!title || title.toLowerCase().includes("shop on ebay")) continue;

    // Filter
    if (!isSealedBoosterBox(title)) continue;

    // Sold price (green = POSITIVE)
    const pm = block.match(/POSITIVE[^>]*>\$([0-9,]+\.[0-9]{2})/);
    if (!pm) continue;
    const price = parseFloat(pm[1].replace(/,/g, ""));

    // Single sealed JP booster box: $25-$500
    if (price < 25 || price > 500) continue;

    items.push({ title: title.substring(0, 120), price });
  }

  return items;
}

// ---- Fetch with retry ----

async function fetchWithRetry(url, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": randomUA(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });

      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      console.log(`  Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) await sleep(3000 + Math.random() * 3000);
    }
  }
  return null;
}

async function fetchEbaySold(query) {
  // Category 261044 = Pokemon Sealed Booster Boxes
  // _udlo=25&_udhi=500 = price range filter
  // LH_Sold=1&LH_Complete=1 = sold only
  // _sop=13 = newest first
  const url = `https://www.ebay.com/sch/261044/i.html?_nkw=${query}&LH_Sold=1&LH_Complete=1&_sop=13&_ipg=120&_udlo=25&_udhi=500&rt=nc&LH_ItemCondition=1000`;

  const html = await fetchWithRetry(url);
  if (!html) return null;

  console.log(`  Page: ${html.length} bytes`);
  if (html.length < 5000) { console.log("  Blocked/CAPTCHA"); return null; }

  const items = parseItems(html);
  console.log(`  Matched ${items.length} sealed booster boxes`);
  if (items.length === 0) return null;

  // Log top matches
  items.slice(0, 3).forEach(it => console.log(`    $${it.price} — "${it.title}"`));

  const prices = items.map(it => it.price).sort((a, b) => a - b);

  // IQR outlier removal for 4+ results
  if (prices.length >= 4) {
    const q1 = prices[Math.floor(prices.length * 0.25)];
    const q3 = prices[Math.floor(prices.length * 0.75)];
    const iqr = q3 - q1;
    const clean = prices.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr);
    if (clean.length > 0) {
      clean.sort((a, b) => a - b);
      return {
        median: Math.round(clean[Math.floor(clean.length / 2)]),
        avg: Math.round(clean.reduce((s, p) => s + p, 0) / clean.length),
        low: Math.round(clean[0]),
        high: Math.round(clean[clean.length - 1]),
        count: clean.length
      };
    }
  }

  return {
    median: Math.round(prices[Math.floor(prices.length / 2)]),
    avg: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
    low: Math.round(prices[0]),
    high: Math.round(prices[prices.length - 1]),
    count: prices.length
  };
}

// ---- Main ----

async function main() {
  console.log("=== eBay Sealed Booster Box Price Scraper ===");
  console.log("Node:", process.version);
  console.log("Time:", new Date().toISOString());
  console.log("Products:", PRODUCTS.length);
  console.log("");

  // Connectivity check
  try {
    const t = await fetch("https://www.ebay.com", { headers: { "User-Agent": randomUA() } });
    console.log(`eBay reachable: HTTP ${t.status}\n`);
  } catch (e) { console.log(`eBay unreachable: ${e.message}\n`); }

  // Load cache
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync("prices-live.json", "utf8")).products || {};
    console.log(`Cache: ${Object.keys(existing).length} products\n`);
  } catch { console.log("No cache found\n"); }

  const results = {};
  const now = new Date().toISOString();
  let ok = 0, fail = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    console.log(`[${i + 1}/${PRODUCTS.length}] ${p.name}`);

    const data = await fetchEbaySold(p.query);

    if (data && data.median > 0) {
      const prev = existing[p.name];
      const prevPrice = prev ? prev.price : data.median;
      const mom = prevPrice > 0
        ? Math.round(((data.median - prevPrice) / prevPrice) * 1000) / 10
        : 0;

      const history = prev ? [...(prev.history || [])] : [];
      if (history.length === 0 || history[history.length - 1] !== data.median) {
        history.push(data.median);
      }
      while (history.length > 12) history.shift();

      results[p.name] = {
        price: data.median, avg: data.avg, low: data.low, high: data.high,
        mom, history, salesCount: data.count, updatedAt: now
      };
      console.log(`  ✓ Median $${data.median} | Range $${data.low}-$${data.high} (${data.count} sales)\n`);
      ok++;
    } else {
      if (existing[p.name]) {
        results[p.name] = { ...existing[p.name] };
        console.log(`  ⟳ Cached: $${existing[p.name].price}\n`);
      } else {
        console.log("  ✗ No data\n");
      }
      fail++;
    }

    // 6-12 second random delay to avoid rate limiting
    await sleep(6000 + Math.random() * 6000);
  }

  fs.writeFileSync("prices-live.json", JSON.stringify({
    lastUpdated: now,
    source: "eBay Sold Listings (Sealed Booster Boxes Only)",
    successCount: ok,
    failCount: fail,
    products: results
  }, null, 2));

  console.log(`\n=== Done: ${ok} updated, ${fail} cached/failed ===`);
  process.exit(0);
}

main().catch(err => {
  console.error("FATAL:", err);
  try {
    if (!fs.existsSync("prices-live.json")) {
      fs.writeFileSync("prices-live.json", JSON.stringify({ lastUpdated: new Date().toISOString(), products: {} }, null, 2));
    }
  } catch {}
  process.exit(0);
});
