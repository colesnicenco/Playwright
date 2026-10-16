import { type Locator, type Page } from '@playwright/test';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Checkout step one: "Checkout: Your Information" */
export class CheckoutInfoPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  readonly errorCloseButton: Locator;

  constructor(readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');
    this.errorCloseButton = page.getByTestId('error-button');
  }

  async goto() {
    await this.page.goto('/checkout-step-one.html');
  }

  /** Fills only the fields that are given, then clicks Continue */
  async submit(info: Partial<CheckoutInfo>) {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
    await this.continueButton.click();
  }
}
