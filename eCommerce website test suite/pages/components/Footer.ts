import { type Locator, type Page } from '@playwright/test';

export class Footer {
  readonly x: Locator;
  readonly facebook: Locator;
  readonly linkedIn: Locator;
  readonly copyright: Locator;

  constructor(page: Page) {
    this.x = page.getByTestId('social-x');
    this.facebook = page.getByTestId('social-facebook');
    this.linkedIn = page.getByTestId('social-linkedin');
    this.copyright = page.getByTestId('footer-copy');
  }
}
