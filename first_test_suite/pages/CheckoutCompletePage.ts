import { type Locator, type Page } from '@playwright/test';

/** Checkout step three: "Checkout: Complete!" */
export class CheckoutCompletePage {
  readonly header: Locator;
  readonly text: Locator;
  readonly image: Locator;
  readonly backHomeButton: Locator;

  constructor(readonly page: Page) {
    this.header = page.getByTestId('complete-header');
    this.text = page.getByTestId('complete-text');
    this.image = page.getByTestId('pony-express');
    this.backHomeButton = page.getByTestId('back-to-products');
  }
}
