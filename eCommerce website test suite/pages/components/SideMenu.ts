import { expect, type Locator, type Page } from '@playwright/test';
import { Header } from './Header';

export class SideMenu {
  /** The sliding panel. Its links stay "visible" off-screen, so its open state is read from aria-hidden */
  readonly panel: Locator;
  readonly closeButton: Locator;
  readonly allItems: Locator;
  readonly dynamicCatalog: Locator;
  readonly lazyLoad: Locator;
  readonly spinner: Locator;
  readonly slider: Locator;
  readonly about: Locator;
  readonly logout: Locator;
  readonly resetAppState: Locator;

  private readonly header: Header;

  constructor(page: Page) {
    this.header = new Header(page);
    this.panel = page.locator('.bm-menu-wrap');
    this.closeButton = page.getByRole('button', { name: 'Close Menu' });
    this.allItems = page.getByTestId('inventory-sidebar-link');
    this.dynamicCatalog = page.getByTestId('dynamic-catalog-sidebar-link');
    this.lazyLoad = page.getByTestId('dynamic-catalog-lazy-load-link');
    this.spinner = page.getByTestId('dynamic-catalog-spinner-link');
    this.slider = page.getByTestId('dynamic-catalog-slider-link');
    this.about = page.getByTestId('about-sidebar-link');
    this.logout = page.getByTestId('logout-sidebar-link');
    this.resetAppState = page.getByTestId('reset-sidebar-link');
  }

  async open() {
    await this.header.menuButton.click();
    await expect(this.panel).toHaveAttribute('aria-hidden', 'false');
  }

  async close() {
    await this.closeButton.click();
    await expect(this.panel).toHaveAttribute('aria-hidden', 'true');
  }

  async openDynamicCatalog(page: 'lazyLoad' | 'spinner' | 'slider') {
    await this.open();
    await this.dynamicCatalog.click();
    await this[page].click();
  }
}
