import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../test-data/products';

test.describe('Side menu', () => {
  test('MENU-01 the menu opens and closes', async ({ inventoryPage, sideMenu }) => {
    await inventoryPage.goto();
    await expect(sideMenu.panel).toHaveAttribute('aria-hidden', 'true');

    await sideMenu.open();
    await expect(sideMenu.allItems).toHaveText('All Items');
    await expect(sideMenu.dynamicCatalog).toHaveText('Dynamic Catalog');
    await expect(sideMenu.about).toHaveText('About');
    await expect(sideMenu.logout).toHaveText('Logout');
    await expect(sideMenu.resetAppState).toHaveText('Reset App State');

    await sideMenu.close();
  });

  test('MENU-02 All Items opens the products page', async ({ page, cartPage, sideMenu }) => {
    await cartPage.goto();
    await sideMenu.open();
    await sideMenu.allItems.click();

    await expect(page).toHaveURL('/inventory.html');
  });

  test('MENU-03 About links to saucelabs.com', async ({ inventoryPage, sideMenu }) => {
    await inventoryPage.goto();
    await expect(sideMenu.about).toHaveAttribute('href', 'https://saucelabs.com/');
  });

  test('MENU-04 Logout ends the session', { tag: '@smoke' }, async ({ page, inventoryPage, sideMenu, loginPage }) => {
    await inventoryPage.goto();
    await sideMenu.open();
    await sideMenu.logout.click();

    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
    const cookies = await page.context().cookies();
    expect(cookies.map((cookie) => cookie.name)).not.toContain('session-username');
  });

  test('MENU-05 Reset App State empties the cart', async ({ cartStorage, header, sideMenu }) => {
    await cartStorage.seed(PRODUCTS.backpack, PRODUCTS.onesie);
    await expect(header.cartBadge).toHaveText('2');

    await sideMenu.open();
    await sideMenu.resetAppState.click();

    await expect(header.cartBadge).toBeHidden();
    expect(await cartStorage.ids()).toEqual([]);
  });

  test('MENU-06 Reset App State resets the Add to cart buttons', async ({ cartStorage, sideMenu, inventoryPage }) => {
    test.fail(true, 'F2: buttons keep showing "Remove" until the page is reloaded');

    await cartStorage.seed(PRODUCTS.backpack, PRODUCTS.onesie);
    await sideMenu.open();
    await sideMenu.resetAppState.click();

    await expect(inventoryPage.addButton(PRODUCTS.backpack)).toBeVisible({ timeout: 2_000 });
    await expect(inventoryPage.addButton(PRODUCTS.onesie)).toBeVisible({ timeout: 2_000 });
  });

  test('MENU-07 Dynamic Catalog shows its submenu', async ({ inventoryPage, sideMenu }) => {
    await inventoryPage.goto();
    await sideMenu.open();
    await sideMenu.dynamicCatalog.click();

    await expect(sideMenu.lazyLoad).toHaveText('Lazy Load');
    await expect(sideMenu.spinner).toHaveText('Spinner');
    await expect(sideMenu.slider).toHaveText('Slider');
  });

  const pages = {
    'products': '/inventory.html',
    'product details': `/inventory-item.html?id=${PRODUCTS.backpack.id}`,
    'cart': '/cart.html',
    'checkout step one': '/checkout-step-one.html',
    'checkout step two': '/checkout-step-two.html',
    'checkout complete': '/checkout-complete.html',
    'lazy load': '/dynamic-catalog-lazy-load.html',
    'spinner': '/dynamic-catalog-spinner.html',
    'slider': '/dynamic-catalog-slider.html',
  };
  for (const [name, path] of Object.entries(pages)) {
    test(`MENU-08 the menu opens on the ${name} page`, async ({ page, sideMenu }) => {
      await page.goto(path);
      await sideMenu.open();
      await expect(sideMenu.logout).toBeVisible();
    });
  }
});
