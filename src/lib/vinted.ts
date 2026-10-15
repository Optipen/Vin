import { supabase } from "./supabase";

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  link: string;
  category: string;
}

export interface LikedProduct extends Product {
  vintedTitle: string;
  vintedDescription: string;
  vintedCategory: string;
  vintedPrice: number;
  likedAt: number;
}

const MARKUP_MULTIPLIER = 2.2;
const MIN_MARKUP = 3;

export function calculateVintedPrice(buyPrice: number): number {
  const marked = Math.ceil(buyPrice * MARKUP_MULTIPLIER);
  return Math.max(marked, buyPrice + MIN_MARKUP);
}

export function generateVintedTitle(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/stokomani/gi, "")
    .trim()
    .slice(0, 100);
}

export function guessVintedCategory(title: string, category: string): string {
  const text = `${title} ${category}`.toLowerCase();

  if (/jouet|peluche|jeu|puzzle|figurine|lego|playmobil/i.test(text)) return "Jouets";
  if (/déco|maison|coussin|bougie|vase|cadre|miroir|lampe/i.test(text)) return "Maison & Déco";
  if (/parfum|cosmétique|maquillage|beauté|soin|crème visage/i.test(text)) return "Beauté";
  if (/sac|pochette|sacoche|valise|trousse/i.test(text)) return "Sacs & Bagagerie";
  if (/bijou|collier|bracelet|bague|montre/i.test(text)) return "Bijoux & Montres";
  if (/sport|fitness|musculation|yoga/i.test(text)) return "Sport";
  if (/outil|bricolage|tournevis|perceuse|clé/i.test(text)) return "Bricolage & Outils";
  if (/high.?tech|écouteur|enceinte|casque|câble|chargeur/i.test(text)) return "High-Tech & Accessoires";
  if (/livre|papeterie|stylo|cahier|agenda/i.test(text)) return "Papeterie & Livres";
  if (/jardin|plante|pot|arrosoir|barbecue/i.test(text)) return "Jardin & Extérieur";
  if (/cuisine|poêle|casserole|ustensile|couteau|planche/i.test(text)) return "Cuisine & Arts de la table";
  if (/rangement|boîte|panier|étagère/i.test(text)) return "Rangement";
  if (/bébé|bebe|puériculture|biberon|poussette/i.test(text)) return "Puériculture";
  if (/accessoire|lunette|ceinture|porte.?clé|portefeuille/i.test(text)) return "Accessoires";
  if (/auto|moto|voiture/i.test(text)) return "Auto & Moto";

  return category || "Divers";
}

export function generateVintedDescription(
  product: Product,
  vintedPrice: number
): string {
  return `${product.title}

Neuf, jamais utilisé.
Acheté en magasin.

État : Neuf avec étiquette
Envoi rapide sous 24-48h.

#destockage #bonplan #neuf`;
}

export function buildLikedProduct(product: Product): LikedProduct {
  const vintedPrice = calculateVintedPrice(product.price);
  return {
    ...product,
    vintedTitle: generateVintedTitle(product.title),
    vintedDescription: generateVintedDescription(product, vintedPrice),
    vintedCategory: guessVintedCategory(product.title, product.category),
    vintedPrice,
    likedAt: Date.now(),
  };
}

export async function getLikedProducts(): Promise<LikedProduct[]> {
  const { data, error } = await supabase
    .from("vinswipe_liked")
    .select("*")
    .order("liked_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    price: Number(row.price),
    image: row.image || "",
    link: row.link || "",
    category: row.category || "",
    vintedTitle: row.vinted_title || "",
    vintedDescription: row.vinted_description || "",
    vintedCategory: row.vinted_category || "",
    vintedPrice: Number(row.vinted_price || 0),
    likedAt: Number(row.liked_at),
  }));
}

export async function addLikedProduct(product: Product): Promise<void> {
  const liked = buildLikedProduct(product);
  await supabase.from("vinswipe_liked").upsert({
    id: liked.id,
    title: liked.title,
    price: liked.price,
    image: liked.image,
    link: liked.link,
    category: liked.category,
    vinted_title: liked.vintedTitle,
    vinted_description: liked.vintedDescription,
    vinted_category: liked.vintedCategory,
    vinted_price: liked.vintedPrice,
    liked_at: liked.likedAt,
  });
}

export async function removeLikedProduct(id: string): Promise<void> {
  await supabase.from("vinswipe_liked").delete().eq("id", id);
}

export async function getSkippedIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("vinswipe_skipped")
    .select("id");

  if (error || !data) return new Set();
  return new Set(data.map((row: any) => row.id));
}

export async function addSkippedId(id: string): Promise<void> {
  await supabase
    .from("vinswipe_skipped")
    .upsert({ id, skipped_at: Date.now() });
}
