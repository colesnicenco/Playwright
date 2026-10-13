import { test, expect } from '../../fixtures/test';
import { PRODUCTS, formatPrice } from '../../test-data/products';

test.describe('Cart', () => {
  test('CART-01 empty cart', async ({ header, cartPage }) => {
    await cartPage.goto();

    await expect(header.title).toHaveText('Your Cart');
    await expect(cartPage.quantityLabel).toHaveText('QTY');
    await expect(cartPage.descriptionLabel).toHaveText('Description');
    await expect(cartPage.items).toHaveCount(0);
    await expect(header.cartBadge).toBeHidden();
  });

  test('CART-02 the cart shows the added products', { tag: '@smoke' }, async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.goto();
    const backpackDescription = await inventoryPage
      .item(PRODUCTS.backpack)
      .getByTestId('inventory-item-desc')
      .textContent();
    await inventoryPage.add(PRODUCTS.backpack, PRODUCTS.bikeLight);
    await header.cartLink.click();

    await expect(cartPage.names).toHaveText([PRODUCTS.backpack.name, PRODUCTS.bikeLight.name]);
    await expect(cartPage.quantities).toHaveText(['1', '1']);
    await expect(cartPage.prices).toHaveText([
      formatPrice(PRODUCTS.backpack.priceCents),
      formatPrice(PRODUCTS.bikeLight.priceCents),
    ]);
    await expect(cartPage.descriptions.first()).toHaveText(backpackDescription!);
  });

  test('CART-03 remove a product in the cart', { tag: '@smoke' }, async ({ cartStorage, header, cartPage }) => {
    await cartStorage.seed(PRODUCTS.backpack, PRODUCTS.bikeLight);
    await cartPage.goto();

    await cartPage.removeButton(PRODUCTS.backpack).click();

    await expect(cartPage.names).toHaveText([PRODUCTS.bikeLight.name]);
    await expect(header.cartBadge).toHaveText('1');
  });

  test('CART-04 remove the last product', async ({ cartStorage, header, cartPage }) => {
    await cartStorage.seed(PRODUCTS.backpack);
    await cartPage.goto();

    await cartPage.removeButton(PRODUCTS.backpack).click();

    await expect(cartPage.items).toHaveCount(0);
    await expect(header.cartBadge).toBeHidden();
  });

  test('CART-05 Continue Shopping keeps the cart', async ({ page, cartStorage, header, cartPage }) => {
    await cartStorage.seed(PRODUCTS.backpack);
    await cartPage.goto();

    await cartPage.continueShoppingButton.click();

    await expect(page).toHaveURL('/inventory.html');
    await expect(header.cartBadge).toHaveText('1');
  });

  test('CART-06 Checkout opens checkout step one', { tag: '@smoke' }, async ({ page, cartStorage, cartPage }) => {
    await cartStorage.seed(PRODUCTS.backpack);
    await cartPage.goto();

    await cartPage.checkoutButton.click();

    await expect(page).toHaveURL('/checkout-step-one.html');
  });

  test('CART-07 checkout is blocked when the cart is empty', async ({ page, cartPage }) => {
    test.fail(true, 'F1: an empty cart can be checked out');

    await cartPage.goto();
    await cartPage.checkoutButton.click({ timeout: 2_000 }).catch(() => {});

    await expect(page).toHaveURL('/cart.html', { timeout: 2_000 });
  });

  test('CART-08 product name opens its details page', async ({ page, cartStorage, cartPage, productPage }) => {
    await cartStorage.seed(PRODUCTS.onesie);
    await cartPage.goto();

    await cartPage.titleLink(PRODUCTS.onesie).click();

    await expect(page).toHaveURL(`/inventory-item.html?id=${PRODUCTS.onesie.id}`);
    await expect(productPage.name).toHaveText(PRODUCTS.onesie.name);
  });

  test('CART-09 products are listed in the order they were added', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.add(PRODUCTS.onesie, PRODUCTS.backpack);
    await cartPage.goto();

    await expect(cartPage.names).toHaveText([PRODUCTS.onesie.name, PRODUCTS.backpack.name]);
  });
});
