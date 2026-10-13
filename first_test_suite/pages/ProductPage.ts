import { type Locator, type Page } from '@playwright/test';
import { slug, type Product } from '../test-data/products';

export class ProductPage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(readonly page: Page) {
    // The products page uses the same data-test ids, and the URL changes before the details
    // render. Scoping to the details panel (which has no data-test) keeps these from briefly
    // matching all six product cards.
    const details = page.locator('.inventory_details');
    this.name = details.getByTestId('inventory-item-name');
    this.description = details.getByTestId('inventory-item-desc');
    this.price = details.getByTestId('inventory-item-price');
    this.addButton = details.getByTestId('add-to-cart');
    this.removeButton = details.getByTestId('remove');
    this.backButton = page.getByTestId('back-to-products');
  }

  async goto(id: number) {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }

  image(product: Product): Locator {
    return this.page.getByTestId(`item-${slug(product)}-img`);
  }
}
