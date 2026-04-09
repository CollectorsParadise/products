const fs = require("fs");

// Map each product to an eBay search query
const PRODUCTS = [
  { name: "Scarlet ex Booster Box (sv1S)", query: "pokemon japanese sv1S scarlet ex booster box" },
  { name: "Violet ex Booster Box (sv1V)", query: "pokemon japanese sv1V violet ex booster box" },
  { name: "Triplet Beat Booster Box (sv1a)", query: "pokemon japanese sv1a triplet beat booster box" },
  { name: "Clay Burst Booster Box (sv2D)", query: "pokemon japanese sv2D clay burst booster box" },
  { name: "Snow Hazard Booster Box (sv2P)", query: "pokemon japanese sv2P snow hazard booster box" },
  { name: "Pokemon Card 151 Booster Box (sv2a)", query: "pokemon japanese sv2a 151 booster box" },
  { name: "Ruler of the Black Flame Booster Box (sv3)", query: "pokemon japanese sv3 ruler black flame booster box" },
  { name: "Raging Surf Booster Box (sv3a)", query: "pokemon japanese sv3a raging surf booster box" },
  { name: "Ancient Roar Booster Box (sv4K)", query: "pokemon japanese sv4K ancient roar booster box" },
  { name: "Future Flash Booster Box (sv4M)", query: "pokemon japanese sv4M future flash booster box" },
  { name: "Shiny Treasure ex Booster Box (sv4a)", query: "pokemon japanese sv4a shiny treasure ex booster box" },
  { name: "Wild Force Booster Box (sv5K)", query: "pokemon japanese sv5K wild force booster box" },
  { name: "Crimson Haze Booster Box (sv5A)", query: "pokemon japanese sv5A crimson haze booster box" },
  { name: "Cyber Judge Booster Box (sv5M)", query: "pokemon japanese sv5M cyber judge booster box" },
  { name: "Mask of Change Booster Box (sv6)", query: "pokemon japanese sv6 mask of change booster box" },
  { name: "Night Wanderer Booster Box (sv6a)", query: "pokemon japanese sv6a night wanderer booster box" },
  { name: "Stellar Miracle Booster Box (sv7)", query: "pokemon japanese sv7 stellar miracle booster box" },
  { name: "Paradise Dragona Booster Box (sv7a)", query: "pokemon japanese sv7a paradise dragona booster box" },
  { name: "Super Electric Breaker Booster Box (sv8)", query: "pokemon japanese sv8 super electric breaker booster box" },
  { name: "Terastal Festival ex Booster Box (sv8a)", query: "pokemon japanese sv8a terastal festival booster box" },
  { name: "Battle Partners Booster Box (sv9)", query: "pokemon japanese sv9 battle partners booster box" },
  { name: "Heat Wave Arena Booster Box (sv9a)", query: "pokemon japanese sv9a heat wave arena booster box" },
  { name: "Glory of Team Rocket Booster Box (sv10)", query: "pokemon japanese sv10 glory team rocket booster box" },
  { name: "Black Bolt Booster Box (sv11B)", query: "pokemon japanese sv11B black bolt booster box" },
  { name: "Black Bolt Deluxe Booster Box (sv11B)", query: "pokemon japanese sv11B black bolt deluxe booster box" },
  { name: "White Flare Booster Box (sv11w)", query: "pokemon japanese sv11W white flare booster box" },
  { name: "White Flare Deluxe Booster Box (sv11w)", query: "pokemon japanese sv11W white flare deluxe booster box" },
  { name: "Mega Brave Booster Box (m1L)", query: "pokemon japanese m1L mega brave booster box" },
  { name: "Mega Symphonia Booster Box (m1S)", query: "pokemon japanese m1S mega symphonia booster box" },
  { name: "Inferno X Booster Box (M2)", query: "pokemon japanese M2 inferno X booster box" },
  { name: "Mega Dream ex Booster Box (M2a)", query: "pokemon japanese M2a mega dream ex booster box" },
  { name: "Munikis Zero Booster Box (M3)", query: "pokemon japanese M3 munikis zero booster box" },
  { name: "Ninja Spinner Booster Box (M4)", query: "pokemon japanese M4 ninja spinner booster box" }
];

// Parse USD prices from eBay sold listings HTML
function parsePrices(html) {
  const prices = [];

  // eBay sold listings show prices in <span class="s-item__price"> elements
  // Pattern 1: $XX.XX format in sold listings
  const priceRegex = /class="s-item__price"[^>]*>\s*<span[^>]*>\$([0-9]+(?:\.[0-9]{2})?)<\/span>/gi;
  let match;
  while ((match = priceRegex.exec(html)) !== null) {
    const p = parseFloat(match[1]);
    if (p > 10 && p < 2000) prices.push(p); // Filter unreasonable prices
  }

  // Pattern 2: Direct text $XX.XX
  if (prices.length === 0) {
    const altRegex = /\$([0-9]+\.[0-9]{2})<\/span>\s*<\/span>\s*<span class="s-item__purchaseOptions/gi;
    while ((match = altRegex.exec(html)) !== null) {
      const p = parseFloat(match[1]);
      if (p > 10 && p < 2000) prices.push(p);
    }
  }

  // Pattern 3: Broader price capture
  if (prices.length === 0) {
    const broadRegex = /POSITIVE[^}]*?\$([0-9]+\.[0-9]{2})/gi;
    while ((match = broadRegex.exec(html)) !== null) {
      const p = parseFloat(match[1]);
      if (p > 10 && p < 2000) prices.push(p);
    }
  }

  // Pattern 4: Most general - any dollar amount near "sold"
  if (prices.length === 0) {
    const genRegex = /\$(\d+\.\d{2})/g;
    while ((match = genRegex.exec(html)) !== null) {
      const p = parseFloat(match[1]);
      if (p > 15 && p < 1500) prices.push(p);
    }
    // Take only unique-ish prices (skip shipping costs etc)
    if (prices.length > 5) {
      prices.sort((a, b) => a - b);
      // Remove bottom 20% (likely shipping) and top 10% (outliers)
      const lo = Math.floor(prices.length * 0.2);
      const hi = Math.ceil(prices.length * 0.9);
      return prices.slice(lo, hi);
    }
  }

  return prices;
}

async function fetchEbaySold(query) {
  const encoded = encodeURIComponent(query);
  // LH_Sold=1 & LH_Complete=1 = completed/sold listings only
  // _sop=13 = sort by end date newest first
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encoded}&LH_Sold=1&LH_Complete=1&_sop=13&_ipg=60`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!res.ok) {
      console.error(`  eBay returned ${res.status} for: ${query}`);
      return null;
    }

    const html = await res.text();
    const prices = parsePrices(html);

    if (prices.length === 0) {
      console.log(`  No sold prices found for: ${query}`);
      return null;
    }

    prices.sort((a, b) => a - b);
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    const low = Math.round(Math.min(...prices));
    const high = Math.round(Math.max(...prices));
    const median = Math.round(prices[Math.floor(prices.length / 2)]);

    return { avg, median, low, high, count: prices.length };
  } catch (err) {
    console.error(`  Fetch error for "${query}":`, err.message);
    return null;
  }
}

async function main() {
  console.log("Fetching eBay sold prices...\n");

  // Load existing prices if available
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync("prices-live.json", "utf8"));
  } catch {}

  const results = {};
  const now = new Date().toISOString();

  for (const product of PRODUCTS) {
    console.log(`Searching: ${product.name}`);
    const data = await fetchEbaySold(product.query);

    if (data) {
      console.log(`  Found ${data.count} sales — Avg: $${data.avg}, Median: $${data.median}, Low: $${data.low}, High: $${data.high}`);

      // Build price history — append to existing
      const prev = existing[product.name];
      const history = prev?.history || [];
      history.push(data.median);
      // Keep last 12 months of data points
      if (history.length > 12) history.shift();

      const prevPrice = prev?.price || data.median;
      const mom = prevPrice > 0
        ? Math.round(((data.median - prevPrice) / prevPrice) * 1000) / 10
        : 0;

      results[product.name] = {
        price: data.median,
        low: data.low,
        high: data.high,
        mom,
        history,
        salesCount: data.count,
        updatedAt: now
      };
    } else {
      // Keep previous data if scrape fails
      if (existing[product.name]) {
        results[product.name] = existing[product.name];
        console.log(`  Using cached price: $${existing[product.name].price}`);
      }
    }

    // Delay between requests to be respectful
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
  }

  // Write results
  const output = {
    lastUpdated: now,
    source: "eBay Sold Listings",
    products: results
  };

  fs.writeFileSync("prices-live.json", JSON.stringify(output, null, 2));
  console.log(`\nDone! Updated ${Object.keys(results).length} products.`);
  console.log(`Written to prices-live.json`);
}

main().catch(console.error);
