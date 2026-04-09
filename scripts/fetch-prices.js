const fs = require("fs");
const https = require("https");
const http = require("http");

const PRODUCTS = [
  { name: "Scarlet ex Booster Box (sv1S)", query: "pokemon japanese sv1S scarlet ex booster box sealed" },
  { name: "Violet ex Booster Box (sv1V)", query: "pokemon japanese sv1V violet ex booster box sealed" },
  { name: "Triplet Beat Booster Box (sv1a)", query: "pokemon japanese sv1a triplet beat booster box sealed" },
  { name: "Clay Burst Booster Box (sv2D)", query: "pokemon japanese sv2D clay burst booster box sealed" },
  { name: "Snow Hazard Booster Box (sv2P)", query: "pokemon japanese sv2P snow hazard booster box sealed" },
  { name: "Pokemon Card 151 Booster Box (sv2a)", query: "pokemon japanese sv2a 151 booster box sealed" },
  { name: "Ruler of the Black Flame Booster Box (sv3)", query: "pokemon japanese sv3 ruler black flame booster box sealed" },
  { name: "Raging Surf Booster Box (sv3a)", query: "pokemon japanese sv3a raging surf booster box sealed" },
  { name: "Ancient Roar Booster Box (sv4K)", query: "pokemon japanese sv4K ancient roar booster box sealed" },
  { name: "Future Flash Booster Box (sv4M)", query: "pokemon japanese sv4M future flash booster box sealed" },
  { name: "Shiny Treasure ex Booster Box (sv4a)", query: "pokemon japanese sv4a shiny treasure ex booster box sealed" },
  { name: "Wild Force Booster Box (sv5K)", query: "pokemon japanese sv5K wild force booster box sealed" },
  { name: "Crimson Haze Booster Box (sv5A)", query: "pokemon japanese sv5A crimson haze booster box sealed" },
  { name: "Cyber Judge Booster Box (sv5M)", query: "pokemon japanese sv5M cyber judge booster box sealed" },
  { name: "Mask of Change Booster Box (sv6)", query: "pokemon japanese sv6 mask of change booster box sealed" },
  { name: "Night Wanderer Booster Box (sv6a)", query: "pokemon japanese sv6a night wanderer booster box sealed" },
  { name: "Stellar Miracle Booster Box (sv7)", query: "pokemon japanese sv7 stellar miracle booster box sealed" },
  { name: "Paradise Dragona Booster Box (sv7a)", query: "pokemon japanese sv7a paradise dragona booster box sealed" },
  { name: "Super Electric Breaker Booster Box (sv8)", query: "pokemon japanese sv8 super electric breaker booster box sealed" },
  { name: "Terastal Festival ex Booster Box (sv8a)", query: "pokemon japanese sv8a terastal festival booster box sealed" },
  { name: "Battle Partners Booster Box (sv9)", query: "pokemon japanese sv9 battle partners booster box sealed" },
  { name: "Heat Wave Arena Booster Box (sv9a)", query: "pokemon japanese sv9a heat wave arena booster box sealed" },
  { name: "Glory of Team Rocket Booster Box (sv10)", query: "pokemon japanese sv10 glory team rocket booster box sealed" },
  { name: "Black Bolt Booster Box (sv11B)", query: "pokemon japanese sv11B black bolt booster box sealed" },
  { name: "Black Bolt Deluxe Booster Box (sv11B)", query: "pokemon japanese sv11B black bolt deluxe booster box sealed" },
  { name: "White Flare Booster Box (sv11w)", query: "pokemon japanese sv11W white flare booster box sealed" },
  { name: "White Flare Deluxe Booster Box (sv11w)", query: "pokemon japanese sv11W white flare deluxe booster box sealed" },
  { name: "Mega Brave Booster Box (m1L)", query: "pokemon japanese m1L mega brave booster box sealed" },
  { name: "Mega Symphonia Booster Box (m1S)", query: "pokemon japanese m1S mega symphonia booster box sealed" },
  { name: "Inferno X Booster Box (M2)", query: "pokemon japanese M2 inferno X booster box sealed" },
  { name: "Mega Dream ex Booster Box (M2a)", query: "pokemon japanese M2a mega dream ex booster box sealed" },
  { name: "Munikis Zero Booster Box (M3)", query: "pokemon japanese M3 munikis zero booster box sealed" },
  { name: "Ninja Spinner Booster Box (M4)", query: "pokemon japanese M4 ninja spinner booster box sealed" }
];

// Simple HTTPS GET that returns a promise
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Cache-Control": "no-cache"
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function parsePrices(html) {
  const prices = [];

  // Multiple regex patterns to catch eBay's price formats
  const patterns = [
    // Pattern: <span class="s-item__price"><span class="POSITIVE">$XX.XX</span>
    /class="POSITIVE[^"]*"[^>]*>\$([0-9,]+(?:\.[0-9]{2})?)</g,
    // Pattern: <span class="s-item__price">$XX.XX</span>
    /class="s-item__price"[^>]*>\$([0-9,]+(?:\.[0-9]{2})?)/g,
    // Pattern: data-view content with price
    /sold\s+for[^$]*\$([0-9,]+(?:\.[0-9]{2})?)/gi,
    // Broad pattern: dollar amounts in item context
    /item__price[^>]*>[^<]*\$([0-9,]+\.[0-9]{2})/g
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const p = parseFloat(match[1].replace(",", ""));
      // Filter: booster boxes typically $20-$800
      if (p >= 20 && p <= 800) prices.push(p);
    }
    if (prices.length >= 3) break;
  }

  // Deduplicate
  return [...new Set(prices)];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchEbaySold(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encoded}&LH_Sold=1&LH_Complete=1&_sop=13&_ipg=60`;

  try {
    const html = await httpGet(url);

    if (!html || html.length < 1000) {
      console.log("  Response too short, likely blocked");
      return null;
    }

    const prices = parsePrices(html);

    if (prices.length === 0) {
      console.log("  No prices found in HTML (" + html.length + " bytes)");
      return null;
    }

    // Remove outliers: keep prices within 2x of median
    prices.sort((a, b) => a - b);
    const rawMedian = prices[Math.floor(prices.length / 2)];
    const filtered = prices.filter(p => p >= rawMedian * 0.4 && p <= rawMedian * 2.5);

    if (filtered.length === 0) return null;

    filtered.sort((a, b) => a - b);
    const avg = Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length);
    const median = Math.round(filtered[Math.floor(filtered.length / 2)]);
    const low = Math.round(filtered[0]);
    const high = Math.round(filtered[filtered.length - 1]);

    return { avg, median, low, high, count: filtered.length };
  } catch (err) {
    console.error("  Error:", err.message);
    return null;
  }
}

async function main() {
  console.log("=== eBay Sold Price Scraper ===\n");
  console.log("Time:", new Date().toISOString(), "\n");

  // Load existing prices
  let existing = {};
  try {
    const raw = fs.readFileSync("prices-live.json", "utf8");
    existing = JSON.parse(raw).products || {};
  } catch (e) {
    console.log("No existing prices-live.json, starting fresh.\n");
  }

  const results = {};
  const now = new Date().toISOString();
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    console.log(`[${i + 1}/${PRODUCTS.length}] ${product.name}`);

    const data = await fetchEbaySold(product.query);

    if (data && data.median > 0) {
      const prevPrice = existing[product.name]?.price || data.median;
      const mom = prevPrice > 0
        ? Math.round(((data.median - prevPrice) / prevPrice) * 1000) / 10
        : 0;

      // Build history
      const history = existing[product.name]?.history || [];
      // Only add if different from last entry or first entry
      if (history.length === 0 || history[history.length - 1] !== data.median) {
        history.push(data.median);
      }
      if (history.length > 12) history.shift();

      results[product.name] = {
        price: data.median,
        low: data.low,
        high: data.high,
        avg: data.avg,
        mom,
        history,
        salesCount: data.count,
        updatedAt: now
      };

      console.log(`  ✓ Median: $${data.median} | Low: $${data.low} | High: $${data.high} (${data.count} sales)`);
      successCount++;
    } else {
      // Keep previous data
      if (existing[product.name]) {
        results[product.name] = existing[product.name];
        console.log(`  ⟳ Using cached: $${existing[product.name].price}`);
      } else {
        console.log("  ✗ No data found");
      }
      failCount++;
    }

    // Polite delay: 2-4 seconds between requests
    await sleep(2000 + Math.random() * 2000);
  }

  // Write output
  const output = {
    lastUpdated: now,
    source: "eBay Sold Listings",
    successCount,
    failCount,
    products: results
  };

  fs.writeFileSync("prices-live.json", JSON.stringify(output, null, 2));

  console.log(`\n=== Complete ===`);
  console.log(`Updated: ${successCount} | Cached: ${failCount}`);
  console.log(`Output: prices-live.json`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
