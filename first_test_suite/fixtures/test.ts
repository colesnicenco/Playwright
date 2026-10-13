import { test as base, type Page } from '@playwright/test';
import { Header } from '../pages/components/Header';
import { SideMenu } from '../pages/components/SideMenu';
import { Footer } from '../pages/components/Footer';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { LazyLoadPage, SliderPage, SpinnerPage } from '../pages/DynamicCatalogPages';
import { type Product } from '../test-data/products';

/** Reads and writes the cart the app keeps in localStorage under "cart-contents" */
export class CartStorage {
  constructor(private readonly page: Page) {}

  /** Puts products in the cart without using the UI, then reloads the products page */
  async seed(...products: Product[]) {
    await this.page.goto('/inventory.html');
    await this.page.evaluate(
      (ids) => localStorage.setItem('cart-contents', JSON.stringify(ids)),
      products.map((product) => product.id),
    );
    await this.page.reload();
  }

  /** Product ids in the cart; [] when the key is missing */
  async ids(): Promise<number[]> {
    const raw = await this.page.evaluate(() => localStorage.getItem('cart-contents'));
    return raw ? JSON.parse(raw) : [];
  }
}

interface Fixtures {
  header: Header;
  sideMenu: SideMenu;
  footer: Footer;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  lazyLoadPage: LazyLoadPage;
  spinnerPage: SpinnerPage;
  sliderPage: SliderPage;
  cartStorage: CartStorage;
}

export const test = base.extend<Fixtures>({
  header: async ({ page }, use) => use(new Header(page)),
  sideMenu: async ({ page }, use) => use(new SideMenu(page)),
  footer: async ({ page }, use) => use(new Footer(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
  lazyLoadPage: async ({ page }, use) => use(new LazyLoadPage(page)),
  spinnerPage: async ({ page }, use) => use(new SpinnerPage(page)),
  sliderPage: async ({ page }, use) => use(new SliderPage(page)),
  cartStorage: async ({ page }, use) => use(new CartStorage(page)),
});

export { expect } from '@playwright/test';

/** Pass to test.use() in files whose tests must start logged out */
export const LOGGED_OUT = { cookies: [], origins: [] };
