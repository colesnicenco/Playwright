import { type Locator, type Page } from '@playwright/test';
import { slug, type Product } from '../test-data/products';

export class CartPage {
  readonly quantityLabel: Locator;
  readonly descriptionLabel: Locator;
  readonly items: Locator;
  readonly names: Locator;
  readonly descriptions: Locator;
  readonly prices: Locator;
  readonly quantities: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(readonly page: Page) {
    this.quantityLabel = page.getByTestId('cart-quantity-label');
    this.descriptionLabel = page.getByTestId('cart-desc-label');
    this.items = page.getByTestId('inventory-item');
    this.names = page.getByTestId('inventory-item-name');
    this.descriptions = page.getByTestId('inventory-item-desc');
    this.prices = page.getByTestId('inventory-item-price');
    this.quantities = page.getByTestId('item-quantity');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${slug(product)}`);
  }

  titleLink(product: Product): Locator {
    return this.page.getByTestId(`item-${product.id}-title-link`);
  }
}
