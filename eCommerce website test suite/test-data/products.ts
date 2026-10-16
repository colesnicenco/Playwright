export interface Product {
  /** Id used in /inventory-item.html?id=<id> and in localStorage "cart-contents" */
  id: number;
  name: string;
  /** Price in cents, so totals can be calculated without floating point errors */
  priceCents: number;
  /** Start of the image file name in /assets/ */
  image: string;
}

export const PRODUCTS = {
  backpack: { id: 4, name: 'Sauce Labs Backpack', priceCents: 2999, image: 'sauce-backpack' },
  bikeLight: { id: 0, name: 'Sauce Labs Bike Light', priceCents: 999, image: 'bike-light' },
  boltTShirt: { id: 1, name: 'Sauce Labs Bolt T-Shirt', priceCents: 1599, image: 'bolt-shirt' },
  fleeceJacket: { id: 5, name: 'Sauce Labs Fleece Jacket', priceCents: 4999, image: 'sauce-pullover' },
  onesie: { id: 2, name: 'Sauce Labs Onesie', priceCents: 799, image: 'red-onesie' },
  redTShirt: { id: 3, name: 'Test.allTheThings() T-Shirt (Red)', priceCents: 1599, image: 'red-tatt' },
} satisfies Record<string, Product>;

/** Every product, in the default "Name (A to Z)" order */
export const ALL_PRODUCTS: Product[] = Object.values(PRODUCTS);

export const TAX_RATE = 0.08;

/** The part of a product's data-test ids that comes from its name, e.g. "add-to-cart-<slug>" */
export function slug(product: Product): string {
  return product.name.toLowerCase().replace(/ /g, '-');
}

/** Formats cents the way the site shows prices: 2999 -> "$29.99" */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Parses a displayed price: "$29.99" or "Total: $29.99" -> 2999 */
export function parsePrice(text: string): number {
  const match = text.match(/\$(\d+)\.(\d{2})/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return Number(match[1]) * 100 + Number(match[2]);
}

export function orderTotals(products: Product[]) {
  const itemTotal = products.reduce((sum, product) => sum + product.priceCents, 0);
  const tax = Math.round(itemTotal * TAX_RATE);
  return { itemTotal, tax, total: itemTotal + tax };
}
