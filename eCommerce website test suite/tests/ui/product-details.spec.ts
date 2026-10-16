import { test, expect } from '../../fixtures/test';
import { ALL_PRODUCTS, PRODUCTS, formatPrice } from '../../test-data/products';

test.describe('Product details', () => {
  for (const product of ALL_PRODUCTS) {
    test(`PD-01 details of ${product.name} match the products page`, async ({ page, inventoryPage, productPage }) => {
      await inventoryPage.goto();
      const card = inventoryPage.item(product);
      const description = await card.getByTestId('inventory-item-desc').textContent();

      await inventoryPage.titleLink(product).click();

      await expect(page).toHaveURL(`/inventory-item.html?id=${product.id}`);
      await expect(productPage.name).toHaveText(product.name);
      await expect(productPage.description).toHaveText(description!);
      await expect(productPage.price).toHaveText(formatPrice(product.priceCents));
      await expect(productPage.image(product)).toHaveAttribute('src', new RegExp(product.image));
    });
  }

  test('PD-02 add to cart from the details page', { tag: '@smoke' }, async ({ header, productPage }) => {
    await productPage.goto(PRODUCTS.backpack.id);
    await productPage.addButton.click();

    await expect(productPage.removeButton).toHaveText('Remove');
    await expect(header.cartBadge).toHaveText('1');
  });

  test('PD-03 remove from the details page', async ({ header, productPage }) => {
    await productPage.goto(PRODUCTS.backpack.id);
    await productPage.addButton.click();
    await productPage.removeButton.click();

    await expect(productPage.addButton).toHaveText('Add to cart');
    await expect(header.cartBadge).toBeHidden();
  });

  test('PD-04 the products page shows a product added on its details page', async ({ productPage, inventoryPage }) => {
    await productPage.goto(PRODUCTS.onesie.id);
    await productPage.addButton.click();
    await productPage.backButton.click();

    await expect(inventoryPage.removeButton(PRODUCTS.onesie)).toBeVisible();
  });

  test('PD-05 Back to products returns to the products page', async ({ page, productPage }) => {
    await productPage.goto(PRODUCTS.backpack.id);
    await productPage.backButton.click();

    await expect(page).toHaveURL('/inventory.html');
  });

  for (const product of ALL_PRODUCTS) {
    test(`PD-06 ?id=${product.id} opens ${product.name}`, async ({ productPage }) => {
      await productPage.goto(product.id);
      await expect(productPage.name).toHaveText(product.name);
    });
  }

  test('PD-07 an unknown id shows "ITEM NOT FOUND"', async ({ productPage }) => {
    await productPage.goto(999);
    await expect(productPage.name).toHaveText('ITEM NOT FOUND');
  });

  test('PD-07b a product that does not exist cannot be added to the cart', async ({ header, productPage, cartStorage }) => {
    test.fail(true, 'F5: the app adds id 999 to the cart and shows badge "1"');

    await productPage.goto(999);
    await productPage.addButton.click();

    await expect(header.cartBadge).toBeHidden({ timeout: 2_000 });
    expect(await cartStorage.ids()).toEqual([]);
  });
});
