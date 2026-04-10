const fs = require("fs");

const PRODUCTS = [
  { name: "Scarlet ex Booster Box (sv1S)", query: "pokemon+japanese+sv1S+booster+box+-pack+-case+-lot+-psa" },
  { name: "Violet ex Booster Box (sv1V)", query: "pokemon+japanese+sv1V+booster+box+-pack+-case+-lot+-psa" },
  { name: "Triplet Beat Booster Box (sv1a)", query: "pokemon+japanese+sv1a+triplet+beat+booster+box+-pack+-case+-lot+-psa" },
  { name: "Clay Burst Booster Box (sv2D)", query: "pokemon+japanese+sv2D+clay+burst+booster+box+-pack+-case+-lot+-psa" },
  { name: "Snow Hazard Booster Box (sv2P)", query: "pokemon+japanese+sv2P+snow+hazard+booster+box+-pack+-case+-lot+-psa" },
  { name: "Pokemon Card 151 Booster Box (sv2a)", query: "pokemon+japanese+sv2a+151+booster+box+-pack+-case+-lot+-psa" },
  { name: "Ruler of the Black Flame Booster Box (sv3)", query: "pokemon+japanese+sv3+ruler+black+flame+booster+box+-pack+-case+-lot+-psa" },
  { name: "Raging Surf Booster Box (sv3a)", query: "pokemon+japanese+sv3a+raging+surf+booster+box+-pack+-case+-lot+-psa" },
  { name: "Ancient Roar Booster Box (sv4K)", query: "pokemon+japanese+sv4K+ancient+roar+booster+box+-pack+-case+-lot+-psa" },
  { name: "Future Flash Booster Box (sv4M)", query: "pokemon+japanese+sv4M+future+flash+booster+box+-pack+-case+-lot+-psa" },
  { name: "Shiny Treasure ex Booster Box (sv4a)", query: "pokemon+japanese+sv4a+shiny+treasure+ex+booster+box+-pack+-case+-lot+-psa" },
  { name: "Wild Force Booster Box (sv5K)", query: "pokemon+japanese+sv5K+wild+force+booster+box+-pack+-case+-lot+-psa" },
  { name: "Crimson Haze Booster Box (sv5A)", query: "pokemon+japanese+sv5a+crimson+haze+booster+box+-pack+-case+-lot+-psa" },
  { name: "Cyber Judge Booster Box (sv5M)", query: "pokemon+japanese+sv5M+cyber+judge+booster+box+-pack+-case+-lot+-psa" },
  { name: "Mask of Change Booster Box (sv6)", query: "pokemon+japanese+sv6+mask+of+change+booster+box+-pack+-case+-lot+-psa" },
  { name: "Night Wanderer Booster Box (sv6a)", query: "pokemon+japanese+sv6a+night+wanderer+booster+box+-pack+-case+-lot+-psa" },
  { name: "Stellar Miracle Booster Box (sv7)", query: "pokemon+japanese+sv7+stellar+miracle+booster+box+-pack+-case+-lot+-psa" },
  { name: "Paradise Dragona Booster Box (sv7a)", query: "pokemon+japanese+sv7a+paradise+dragona+booster+box+-pack+-case+-lot+-psa" },
  { name: "Super Electric Breaker Booster Box (sv8)", query: "pokemon+japanese+sv8+super+electric+breaker+booster+box+-pack+-case+-lot+-psa" },
  { name: "Terastal Festival ex Booster Box (sv8a)", query: "pokemon+japanese+sv8a+terastal+festival+booster+box+-pack+-case+-lot+-psa" },
  { name: "Battle Partners Booster Box (sv9)", query: "pokemon+japanese+sv9+battle+partners+booster+box+-pack+-case+-lot+-psa" },
  { name: "Heat Wave Arena Booster Box (sv9a)", query: "pokemon+japanese+sv9a+heat+wave+arena+booster+box+-pack+-case+-lot+-psa" },
  { name: "Glory of Team Rocket Booster Box (sv10)", query: "pokemon+japanese+sv10+glory+team+rocket+booster+box+-pack+-case+-lot+-psa" },
  { name: "Black Bolt Booster Box (sv11B)", query: "pokemon+japanese+sv11B+black+bolt+booster+box+-pack+-case+-lot+-psa+-deluxe" },
  { name: "Black Bolt Deluxe Booster Box (sv11B)", query: "pokemon+japanese+sv11B+black+bolt+deluxe+booster+box+-pack+-case+-lot+-psa" },
  { name: "White Flare Booster Box (sv11w)", query: "pokemon+japanese+sv11W+white+flare+booster+box+-pack+-case+-lot+-psa+-deluxe" },
  { name: "White Flare Deluxe Booster Box (sv11w)", query: "pokemon+japanese+sv11W+white+flare+deluxe+booster+box+-pack+-case+-lot+-psa" },
  { name: "Mega Brave Booster Box (m1L)", query: "pokemon+japanese+mega+brave+m1L+booster+box+-pack+-case+-lot+-psa" },
  { name: "Mega Symphonia Booster Box (m1S)", query: "pokemon+japanese+mega+symphonia+m1S+booster+box+-pack+-case+-lot+-psa" },
  { name: "Inferno X Booster Box (M2)", query: "pokemon+japanese+inferno+X+M2+booster+box+-pack+-case+-lot+-psa" },
  { name: "Mega Dream ex Booster Box (M2a)", query: "pokemon+japanese+mega+dream+ex+M2a+booster+box+-pack+-case+-lot+-psa" },
  { name: "Munikis Zero Booster Box (M3)", query: "pokemon+japanese+munikis+zero+M3+booster+box+-pack+-case+-lot+-psa" },
  { name: "Ninja Spinner Booster Box (M4)", query: "pokemon+japanese+ninja+spinner+M4+booster+box+-pack+-case+-lot+-psa" }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseItems(html) {
  const items = [];

  // Split HTML into individual sold items using eBay's item container
  const itemBlocks = html.split(/class="s-item__wrapper/g);

  for (let i = 1; i < itemBlocks.length; i++) {
    const block = itemBlocks[i];

    // Get the item title
    const titleMatch = block.match(/class="s-item__title"[^>]*>(?:<span[^>]*>)?(.*?)(?:<\/span>)?<\//s);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim().toLowerCase() : "";

    // Skip if title contains unwanted keywords
    if (!title) continue;
    if (title.includes("pack") && !title.includes("box")) continue;
    if (title.includes("case") && !title.includes("box")) continue;
    if (title.includes("lot of")) continue;
    if (title.includes("psa ")) continue;
    if (title.includes("cgc ")) continue;
    if (title.includes("bgs ")) continue;
    if (title.includes("single")) continue;
    if (title.includes("card sleeves")) continue;
    if (title.includes("playmat")) continue;
    if (title.includes("2 box") || title.includes("3 box") || title.includes("4 box")) continue;
    if (title.includes("2x") || title.includes("3x") || title.includes("4x") || title.includes("5x")) continue;

    // Must contain "box" or "booster box"
    if (!title.includes("box")) continue;

    // Get the sold price — look for POSITIVE (green = sold) price
    const priceMatch = block.match(/POSITIVE[^>]*>\$([0-9,]+\.[0-9]{2})/);
    if (!priceMatch) continue;

    const price = parseFloat(priceMatch[1].replace(/,/g, ""));

    // Reasonable single box price range: $25-$600
    if (price < 25 || price > 600) continue;

    items.push({ title: title.substring(0, 80), price });
  }

  return items;
}

async function fetchEbaySold(query) {
  // LH_Sold=1 = sold only, LH_Complete=1 = completed, _sop=13 = newest first
  // LH_BIN=1 = Buy It Now only (skip auctions with weird prices)
  const url = `https://www.ebay.com/sch/i.html?_nkw=${query}&LH_Sold=1&LH_Complete=1&_sop=13&_ipg=120&rt=nc`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.log(`  HTTP ${res.status}`);
      return null;
    }

    const html = await res.text();
    console.log(`  Page: ${html.length} bytes`);

    if (html.length < 5000) {
      console.log("  Page too small — blocked or CAPTCHA");
      return null;
    }

    const items = parseItems(html);
    console.log(`  Matched ${items.length} sold box listings`);

    if (items.length === 0) return null;

    // Log first 3 matches for debugging
    items.slice(0, 3).forEach(it => {
      console.log(`    "$${it.price}" — ${it.title}`);
    });

    const prices = items.map(it => it.price);
    prices.sort((a, b) => a - b);

    // IQR outlier removal
    if (prices.length >= 4) {
      const q1 = prices[Math.floor(prices.length * 0.25)];
      const q3 = prices[Math.floor(prices.length * 0.75)];
      const iqr = q3 - q1;
      const filtered = prices.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr);
      if (filtered.length > 0) {
        filtered.sort((a, b) => a - b);
        return {
          median: Math.round(filtered[Math.floor(filtered.length / 2)]),
          avg: Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length),
          low: Math.round(filtered[0]),
          high: Math.round(filtered[filtered.length - 1]),
          count: filtered.length
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
  } catch (err) {
    console.log(`  Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log("=== eBay Sold Price Scraper ===");
  console.log("Node:", process.version);
  console.log("Time:", new Date().toISOString());
  console.log("");

  // Load existing
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync("prices-live.json", "utf8")).products || {};
    console.log(`Loaded ${Object.keys(existing).length} cached prices\n`);
  } catch {
    console.log("No cache found\n");
  }

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
        price: data.median,
        avg: data.avg,
        low: data.low,
        high: data.high,
        mom,
        history,
        salesCount: data.count,
        updatedAt: now
      };

      console.log(`  ✓ Median $${data.median} | Avg $${data.avg} | Low $${data.low} | High $${data.high} (${data.count} sales)\n`);
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

    await sleep(2500 + Math.random() * 2000);
  }

  fs.writeFileSync("prices-live.json", JSON.stringify({
    lastUpdated: now,
    source: "eBay Sold Listings",
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
