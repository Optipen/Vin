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

export function likeProduct(product: Product): LikedProduct {
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

export function getLikedProducts(): LikedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("vin-liked");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLikedProducts(products: LikedProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("vin-liked", JSON.stringify(products));
  } catch {}
}

export function addLikedProduct(product: Product): LikedProduct[] {
  const liked = getLikedProducts();
  if (liked.some((p) => p.id === product.id)) return liked;
  const newLiked = [likeProduct(product), ...liked];
  saveLikedProducts(newLiked);
  return newLiked;
}

export function removeLikedProduct(id: string): LikedProduct[] {
  const liked = getLikedProducts().filter((p) => p.id !== id);
  saveLikedProducts(liked);
  return liked;
}

export function getSkippedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const data = localStorage.getItem("vin-skipped");
    return new Set(data ? JSON.parse(data) : []);
  } catch {
    return new Set();
  }
}

export function addSkippedId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const skipped = getSkippedIds();
    skipped.add(id);
    localStorage.setItem("vin-skipped", JSON.stringify([...skipped]));
  } catch {}
}
