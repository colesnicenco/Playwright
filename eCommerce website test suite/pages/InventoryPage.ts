import { type Locator, type Page } from '@playwright/test';
import { parsePrice, slug, type Product } from '../test-data/products';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly items: Locator;
  readonly names: Locator;
  readonly descriptions: Locator;
  readonly prices: Locator;
  readonly sortSelect: Locator;
  readonly activeSort: Locator;

  constructor(readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.names = page.getByTestId('inventory-item-name');
    this.descriptions = page.getByTestId('inventory-item-desc');
    this.prices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.activeSort = page.getByTestId('active-option');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** The card of one product */
  item(product: Product): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(product.name, { exact: true }),
    });
  }

  image(product: Product): Locator {
    return this.page.getByTestId(`inventory-item-${slug(product)}-img`);
  }

  titleLink(product: Product): Locator {
    return this.page.getByTestId(`item-${product.id}-title-link`);
  }

  imageLink(product: Product): Locator {
    return this.page.getByTestId(`item-${product.id}-img-link`);
  }

  addButton(product: Product): Locator {
    return this.page.getByTestId(`add-to-cart-${slug(product)}`);
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${slug(product)}`);
  }

  async add(...products: Product[]) {
    for (const product of products) await this.addButton(product).click();
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async priceValues(): Promise<number[]> {
    return (await this.prices.allTextContents()).map(parsePrice);
  }
}
