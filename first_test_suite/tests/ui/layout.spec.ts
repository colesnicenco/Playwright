import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../test-data/products';

const LOGGED_IN_PAGES = [
  '/inventory.html',
  `/inventory-item.html?id=${PRODUCTS.backpack.id}`,
  '/cart.html',
  '/checkout-step-one.html',
  '/checkout-step-two.html',
  '/checkout-complete.html',
  '/dynamic-catalog-lazy-load.html',
  '/dynamic-catalog-spinner.html',
  '/dynamic-catalog-slider.html',
];

test.describe('Header and footer', () => {
  for (const path of LOGGED_IN_PAGES) {
    test(`LAY-01 header is shown on ${path}`, async ({ page, header }) => {
      await page.goto(path);

      await expect(header.logo).toHaveText('Swag Labs');
      await expect(header.menuButton).toBeVisible();
      await expect(header.cartLink).toBeVisible();
    });
  }

  test('LAY-02 the cart icon opens the cart from the products page', async ({ page, inventoryPage, header }) => {
    await inventoryPage.goto();
    await header.cartLink.click();
    await expect(page).toHaveURL('/cart.html');
  });

  test('LAY-02 the cart icon opens the cart from a details page', async ({ page, productPage, header }) => {
    await productPage.goto(PRODUCTS.backpack.id);
    await header.cartLink.click();
    await expect(page).toHaveURL('/cart.html');
  });

  test('LAY-03 social links point to Sauce Labs and open in a new tab', async ({ inventoryPage, footer }) => {
    await inventoryPage.goto();

    const links = [
      [footer.x, 'https://x.com/saucelabs'],
      [footer.facebook, 'https://www.facebook.com/saucelabs'],
      [footer.linkedIn, 'https://www.linkedin.com/company/sauce-labs/'],
    ] as const;
    for (const [link, href] of links) {
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });

  test('LAY-04 copyright line shows the current year', async ({ inventoryPage, footer }) => {
    await inventoryPage.goto();
    await expect(footer.copyright).toContainText(
      `© ${new Date().getFullYear()} Sauce Labs. All Rights Reserved.`,
    );
  });

  test('LAY-05 the page title is Swag Labs', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();
    await expect(page).toHaveTitle('Swag Labs');
  });
});
