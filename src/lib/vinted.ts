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

  if (/t-shirt|tee.?shirt/i.test(text)) return "T-shirts";
  if (/pull|sweat|hoodie/i.test(text)) return "Pulls & Sweats";
  if (/pantalon|jean|jogger/i.test(text)) return "Pantalons & Jeans";
  if (/veste|blouson|manteau/i.test(text)) return "Vestes & Manteaux";
  if (/robe/i.test(text)) return "Robes";
  if (/jupe/i.test(text)) return "Jupes";
  if (/short|bermuda/i.test(text)) return "Shorts";
  if (/chaussur|basket|sneaker|botte/i.test(text)) return "Chaussures";
  if (/sac|pochette|sacoche/i.test(text)) return "Sacs";
  if (/bijou|collier|bracelet|bague/i.test(text)) return "Bijoux";
  if (/parfum|cosmétique|maquillage|beauté|soin/i.test(text)) return "Beauté";
  if (/jouet|peluche|jeu/i.test(text)) return "Jouets";
  if (/déco|maison|coussin|bougie|vase/i.test(text)) return "Maison & Déco";
  if (/enfant|bébé|kid/i.test(text)) return "Enfants";
  if (/homme|man/i.test(text)) return "Homme";
  if (/femme|woman/i.test(text)) return "Femme";
  if (/accessoire|ceinture|écharpe|bonnet/i.test(text)) return "Accessoires";
  if (/sport|fitness/i.test(text)) return "Sport";
  if (/linge|serviette|drap/i.test(text)) return "Linge de maison";

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
