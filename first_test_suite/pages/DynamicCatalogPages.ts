import { type Locator, type Page } from '@playwright/test';

// Cards on these pages have data-test ids like "<prefix>-item-<n>-name", so they are
// matched by prefix and suffix rather than by one fixed id.
function cardParts(page: Page, prefix: string) {
  const part = (suffix: string) => page.locator(`[data-test^="${prefix}-item-"][data-test$="-${suffix}"]`);
  return { names: part('name'), prices: part('price'), images: part('img') };
}

export class LazyLoadPage {
  readonly names: Locator;
  readonly prices: Locator;
  readonly images: Locator;
  /** "Loading…" cards waiting to be replaced by products */
  readonly placeholders: Locator;

  constructor(readonly page: Page) {
    ({ names: this.names, prices: this.prices, images: this.images } = cardParts(page, 'lazy-load'));
    this.placeholders = page.locator('[data-test^="lazy-load-item-"][data-test$="-placeholder"]');
  }

  async goto() {
    await this.page.goto('/dynamic-catalog-lazy-load.html');
  }
}

export class SpinnerPage {
  readonly spinner: Locator;
  readonly names: Locator;
  readonly prices: Locator;
  readonly images: Locator;

  constructor(readonly page: Page) {
    this.spinner = page.getByRole('status', { name: 'Loading' });
    ({ names: this.names, prices: this.prices, images: this.images } = cardParts(page, 'spinner'));
  }

  async goto() {
    await this.page.goto('/dynamic-catalog-spinner.html');
  }
}

export class SliderPage {
  readonly name: Locator;
  readonly price: Locator;
  readonly dots: Locator;

  constructor(readonly page: Page) {
    this.name = page.getByTestId('dynamic-catalog-slider-item-name');
    this.price = page.getByTestId('dynamic-catalog-slider-item-price');
    this.dots = page.locator('[data-test^="dynamic-catalog-slider-dot-"]');
  }

  async goto() {
    await this.page.goto('/dynamic-catalog-slider.html');
  }

  dot(index: number): Locator {
    return this.page.getByTestId(`dynamic-catalog-slider-dot-${index}`);
  }
}
