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

async function fetchShopifyJSON(page: number): Promise<Product[]> {
  const url = `https://www.stokomani.fr/collections/arrivages/products.json?limit=30&page=${page}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error("Shopify JSON failed");

  const data = await res.json();
  return (data.products || []).map((p: any) => ({
    id: String(p.id),
    title: p.title || "",
    price: parseFloat(p.variants?.[0]?.price || "0"),
    image: p.images?.[0]?.src || "",
    link: `https://www.stokomani.fr/products/${p.handle}`,
    category: p.product_type || "Divers",
  }));
}

async function fetchHTMLScrape(page: number): Promise<Product[]> {
  const url = `https://www.stokomani.fr/collections/arrivages?page=${page}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
      const price = parseFloat(priceText.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;

      const imgEl = $el.find("img").first();
      let image = imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("data-srcset")?.split(" ")[0] || "";
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

      products.push({
        id,
        title,
        price,
        image,
        link,
        category: "Divers",
      });
    }
  );

  return products;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const products = await fetchShopifyJSON(page);
    if (products.length > 0) {
      return NextResponse.json({ products, source: "shopify" });
    }
  } catch {
    // Shopify JSON not available, try HTML scraping
  }

  try {
    const products = await fetchHTMLScrape(page);
    return NextResponse.json({ products, source: "html" });
  } catch (err: any) {
    return NextResponse.json(
      {
        products: [],
        error: `Impossible de récupérer les produits: ${err.message}`,
        source: "error",
      },
      { status: 502 }
    );
  }
}
