import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  link: string;
  category: string;
}

const FOOD_KEYWORDS = [
  "alimenta", "nourriture", "gâteau", "gateau", "biscuit", "chocolat",
  "bonbon", "chips", "boisson", "jus", "café", "cafe", "thé", "the",
  "sucre", "farine", "pâte", "pate", "riz", "huile", "vinaigre",
  "sauce", "conserve", "céréale", "cereale", "confiture", "miel",
  "lait", "fromage", "yaourt", "beurre", "crème", "creme fraiche",
  "surgelé", "surgele", "glace", "sorbet", "pizza", "plat cuisiné",
  "soupe", "potage", "bouillon", "épice", "epice", "sel", "poivre",
  "moutarde", "ketchup", "mayonnaise", "vinaigrette", "soda",
  "eau minérale", "eau minerale", "sirop", "nectar", "compote",
  "fruit sec", "cacahuète", "cacahuete", "amande", "noix", "noisette",
  "pistache", "olive", "cornichon", "sardine", "thon", "saumon",
  "jambon", "saucisson", "pâté", "pate", "rillette", "foie gras",
  "nutella", "speculoos", "haribo", "coca", "pepsi", "fanta",
  "oasis", "orangina", "schweppes", "perrier", "evian", "volvic",
  "capsule nespresso", "dosette", "infusion", "tisane",
  "protéine alimentaire", "barre énergétique", "barre energetique",
  "croquette", "pâtée", "patee", "friandise chien", "friandise chat",
  "litière", "litiere",
];

const VINTED_COLLECTIONS = [
  "arrivages",
  "mode-femme",
  "mode-homme",
  "mode-enfant",
  "chaussures",
  "maison-deco",
  "beaute",
  "jouets",
  "bagagerie",
  "linge-de-maison",
  "accessoires",
  "sport",
  "bebe",
  "puericulture",
];

function isFoodProduct(title: string, category: string): boolean {
  const text = `${title} ${category}`.toLowerCase();
  return FOOD_KEYWORDS.some((kw) => text.includes(kw));
}

function isVintedSellable(title: string, category: string): boolean {
  if (isFoodProduct(title, category)) return false;

  const text = `${title} ${category}`.toLowerCase();
  const excluded = [
    "alimenta", "épicerie", "epicerie", "boisson", "frais",
    "surgelé", "surgele", "animalerie", "croquette",
    "lessive", "liquide vaisselle", "nettoyant", "javel",
    "papier toilette", "essuie-tout", "mouchoir",
    "couche pampers", "couche bébé",
  ];
  return !excluded.some((kw) => text.includes(kw));
}

async function fetchShopifyJSON(collection: string, page: number): Promise<Product[]> {
  const url = `https://www.stokomani.fr/collections/${collection}/products.json?limit=30&page=${page}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error("Shopify JSON failed");

  const data = await res.json();
  return (data.products || [])
    .map((p: any) => ({
      id: String(p.id),
      title: p.title || "",
      price: parseFloat(p.variants?.[0]?.price || "0"),
      image: p.images?.[0]?.src || "",
      link: `https://www.stokomani.fr/products/${p.handle}`,
      category: p.product_type || collection,
    }))
    .filter((p: Product) => isVintedSellable(p.title, p.category));
}

async function fetchHTMLScrape(collection: string, page: number): Promise<Product[]> {
  const url = `https://www.stokomani.fr/collections/${collection}?page=${page}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const products: Product[] = [];

  $(".product-card, .product-item, [data-product-id], .grid__item .card").each(
    (i, el) => {
      const $el = $(el);
      const title =
        $el
          .find(
            ".product-card__title, .card__heading, .product-title, h3, h2"
          )
          .first()
          .text()
          .trim() || `Produit ${i + 1}`;

      const priceText =
        $el
          .find(
            ".price-item--sale, .price-item--regular, .price, .product-price"
          )
          .first()
          .text()
          .trim() || "0";
      const price =
        parseFloat(priceText.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;

      const imgEl = $el.find("img").first();
      let image =
        imgEl.attr("src") ||
        imgEl.attr("data-src") ||
        imgEl.attr("data-srcset")?.split(" ")[0] ||
        "";
      if (image.startsWith("//")) image = "https:" + image;

      const linkEl = $el.find("a").first();
      let link = linkEl.attr("href") || "";
      if (link && !link.startsWith("http")) {
        link = "https://www.stokomani.fr" + link;
      }

      const id =
        $el.attr("data-product-id") ||
        $el.attr("data-id") ||
        link.split("/").pop() ||
        String(i);

      if (isVintedSellable(title, collection)) {
        products.push({ id, title, price, image, link, category: collection });
      }
    }
  );

  return products;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const collectionParam = searchParams.get("collection") || "";

  const collections = collectionParam
    ? [collectionParam]
    : VINTED_COLLECTIONS;

  const allProducts: Product[] = [];
  const errors: string[] = [];

  for (const collection of collections) {
    try {
      const products = await fetchShopifyJSON(collection, page);
      if (products.length > 0) {
        allProducts.push(...products);
        continue;
      }
    } catch {
      // Shopify JSON not available, try HTML
    }

    try {
      const products = await fetchHTMLScrape(collection, page);
      allProducts.push(...products);
    } catch (err: any) {
      errors.push(`${collection}: ${err.message}`);
    }

    if (allProducts.length >= 50) break;
  }

  if (allProducts.length === 0 && errors.length > 0) {
    return NextResponse.json(
      {
        products: [],
        error: `Impossible de récupérer les produits. ${errors[0]}`,
        source: "error",
      },
      { status: 502 }
    );
  }

  const seen = new Set<string>();
  const unique = allProducts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return NextResponse.json({
    products: unique,
    source: errors.length > 0 ? "partial" : "ok",
    store: "Lagny-sur-Marne",
  });
}
