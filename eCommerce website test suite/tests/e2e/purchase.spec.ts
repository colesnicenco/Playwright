import { test, expect, LOGGED_OUT } from '../../fixtures/test';
import { PRODUCTS, formatPrice, orderTotals } from '../../test-data/products';
import { CHECKOUT_INFO, PASSWORD, USERS } from '../../test-data/users';
import { CHECKOUT_TEXT } from '../../test-data/messages';

// These journeys go through the real login form instead of the saved session
test.use({ storageState: LOGGED_OUT });

test.describe('Purchase journeys', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL('/inventory.html');
  });

  test('E2E-01 buy one product and log out', { tag: '@smoke' }, async ({
    page, header, sideMenu, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage, loginPage,
  }) => {
    await test.step('add a product', async () => {
      await inventoryPage.add(PRODUCTS.backpack);
      await expect(header.cartBadge).toHaveText('1');
    });

    await test.step('check the cart', async () => {
      await header.cartLink.click();
      await expect(cartPage.names).toHaveText([PRODUCTS.backpack.name]);
      await cartPage.checkoutButton.click();
    });

    await test.step('fill in the information and check the overview', async () => {
      await checkoutInfoPage.submit(CHECKOUT_INFO);
      await expect(checkoutOverviewPage.names).toHaveText([PRODUCTS.backpack.name]);
      await expect(checkoutOverviewPage.total).toHaveText(
        `Total: ${formatPrice(orderTotals([PRODUCTS.backpack]).total)}`,
      );
      await checkoutOverviewPage.finishButton.click();
    });

    await test.step('order is complete', async () => {
      await expect(checkoutCompletePage.header).toHaveText(CHECKOUT_TEXT.completeHeader);
      await checkoutCompletePage.backHomeButton.click();
      await expect(page).toHaveURL('/inventory.html');
      await expect(header.cartBadge).toBeHidden();
    });

    await test.step('log out', async () => {
      await sideMenu.open();
      await sideMenu.logout.click();
      await expect(loginPage.loginButton).toBeVisible();
    });
  });

  test('E2E-02 sort by price and buy the two cheapest products', { tag: '@smoke' }, async ({
    header, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    await inventoryPage.sortBy('lohi');
    await expect(inventoryPage.names.first()).toHaveText(PRODUCTS.onesie.name);

    // The two cheapest are first after sorting low to high
    await inventoryPage.items.nth(0).getByRole('button', { name: 'Add to cart' }).click();
    await inventoryPage.items.nth(1).getByRole('button', { name: 'Add to cart' }).click();

    const cheapest = [PRODUCTS.onesie, PRODUCTS.bikeLight];
    const totals = orderTotals(cheapest);

    await header.cartLink.click();
    await expect(cartPage.names).toHaveText(cheapest.map((product) => product.name));
    await cartPage.checkoutButton.click();
    await checkoutInfoPage.submit(CHECKOUT_INFO);

    await expect(checkoutOverviewPage.itemTotal).toHaveText(`Item total: ${formatPrice(totals.itemTotal)}`);
    await expect(checkoutOverviewPage.tax).toHaveText(`Tax: ${formatPrice(totals.tax)}`);
    await expect(checkoutOverviewPage.total).toHaveText(`Total: ${formatPrice(totals.total)}`);
    await checkoutOverviewPage.finishButton.click();

    await expect(checkoutCompletePage.header).toHaveText(CHECKOUT_TEXT.completeHeader);
  });

  test('E2E-03 change the cart while shopping, then buy', async ({
    header, inventoryPage, productPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    await inventoryPage.titleLink(PRODUCTS.fleeceJacket).click();
    await productPage.addButton.click();
    await productPage.backButton.click();
    await inventoryPage.add(PRODUCTS.bikeLight);

    await header.cartLink.click();
    await cartPage.removeButton(PRODUCTS.fleeceJacket).click();
    await cartPage.continueShoppingButton.click();
    await inventoryPage.add(PRODUCTS.onesie);

    await header.cartLink.click();
    await expect(cartPage.names).toHaveText([PRODUCTS.bikeLight.name, PRODUCTS.onesie.name]);
    await cartPage.checkoutButton.click();
    await checkoutInfoPage.submit(CHECKOUT_INFO);
    await expect(checkoutOverviewPage.names).toHaveText([PRODUCTS.bikeLight.name, PRODUCTS.onesie.name]);
    await checkoutOverviewPage.finishButton.click();

    await expect(checkoutCompletePage.header).toHaveText(CHECKOUT_TEXT.completeHeader);
  });

  test('E2E-04 cancel at the overview, change the cart, then buy', async ({
    header, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    await inventoryPage.add(PRODUCTS.backpack, PRODUCTS.boltTShirt);
    await header.cartLink.click();
    await cartPage.checkoutButton.click();
    await checkoutInfoPage.submit(CHECKOUT_INFO);
    await checkoutOverviewPage.cancelButton.click();

    // Cancel goes back to the products page with the cart unchanged
    await expect(header.cartBadge).toHaveText('2');
    await inventoryPage.removeButton(PRODUCTS.boltTShirt).click();
    await inventoryPage.add(PRODUCTS.redTShirt);

    await header.cartLink.click();
    await cartPage.checkoutButton.click();
    await checkoutInfoPage.submit(CHECKOUT_INFO);
    await expect(checkoutOverviewPage.names).toHaveText([PRODUCTS.backpack.name, PRODUCTS.redTShirt.name]);
    await expect(checkoutOverviewPage.total).toHaveText(
      `Total: ${formatPrice(orderTotals([PRODUCTS.backpack, PRODUCTS.redTShirt]).total)}`,
    );
    await checkoutOverviewPage.finishButton.click();

    await expect(checkoutCompletePage.header).toHaveText(CHECKOUT_TEXT.completeHeader);
  });
});
