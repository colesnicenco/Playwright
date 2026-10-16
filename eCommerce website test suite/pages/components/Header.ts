import { type Locator, type Page } from '@playwright/test';

/** The header shown on every page after login */
export class Header {
  readonly logo: Locator;
  // data-test="open-menu" is an image covered by this button, so it can't be clicked
  readonly menuButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  /** Page title in the secondary header, e.g. "Products" or "Your Cart" */
  readonly title: Locator;

  constructor(page: Page) {
    this.logo = page.locator('.app_logo');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.title = page.getByTestId('title');
  }
}
