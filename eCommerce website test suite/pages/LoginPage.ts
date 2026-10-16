import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;
  readonly errorCloseButton: Locator;
  /** Red ✖ icons shown inside the fields while an error is displayed */
  readonly fieldErrorIcons: Locator;
  readonly credentials: Locator;
  readonly passwordInfo: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
    this.errorCloseButton = page.getByTestId('error-button');
    this.fieldErrorIcons = page.locator('.form_group .error_icon');
    this.credentials = page.getByTestId('login-credentials');
    this.passwordInfo = page.getByTestId('login-password');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    if (username) await this.username.fill(username);
    if (password) await this.password.fill(password);
    await this.loginButton.click();
  }

  /** Lines under a credentials block heading; the heading itself ends with ":" and is dropped */
  async readList(block: Locator): Promise<string[]> {
    const text = await block.innerText();
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.endsWith(':'));
  }
}
