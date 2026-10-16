import { type Locator, type Page } from '@playwright/test';

/** Checkout step two: "Checkout: Overview" */
export class CheckoutOverviewPage {
  readonly names: Locator;
  readonly prices: Locator;
  readonly quantities: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(readonly page: Page) {
    this.names = page.getByTestId('inventory-item-name');
    this.prices = page.getByTestId('inventory-item-price');
    this.quantities = page.getByTestId('item-quantity');
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  async goto() {
    await this.page.goto('/checkout-step-two.html');
  }
}
