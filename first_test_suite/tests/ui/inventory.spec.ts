import { test, expect } from '../../fixtures/test';
import { ALL_PRODUCTS, PRODUCTS, formatPrice } from '../../test-data/products';

const NAMES_A_TO_Z = ALL_PRODUCTS.map((product) => product.name).sort();

test.describe('Products page', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('INV-01 page loads with all products', { tag: '@smoke' }, async ({ header, inventoryPage }) => {
    await expect(header.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(ALL_PRODUCTS.length);
  });

  test('INV-02 product data is correct', async ({ inventoryPage }) => {
    for (const product of ALL_PRODUCTS) {
      await test.step(product.name, async () => {
        const card = inventoryPage.item(product);
        await expect(card.getByTestId('inventory-item-price')).toHaveText(formatPrice(product.priceCents));
        await expect(card.getByTestId('inventory-item-desc')).not.toBeEmpty();

        const image = inventoryPage.image(product);
        await expect(image).toHaveAttribute('alt', product.name);
        await expect(image).toHaveAttribute('src', new RegExp(product.image));
        // A broken image has a natural width of 0
        await expect
          .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
          .toBe(true);
      });
    }
  });

  test('INV-03 default sort is Name (A to Z)', async ({ inventoryPage }) => {
    await expect(inventoryPage.activeSort).toHaveText('Name (A to Z)');
    await expect(inventoryPage.names).toHaveText(NAMES_A_TO_Z);
  });

  test('INV-04 sort by Name (Z to A)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    await expect(inventoryPage.activeSort).toHaveText('Name (Z to A)');
    await expect(inventoryPage.names).toHaveText([...NAMES_A_TO_Z].reverse());
  });

  test('INV-05 sort by Price (low to high)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    await expect(inventoryPage.activeSort).toHaveText('Price (low to high)');
    const prices = await inventoryPage.priceValues();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('INV-06 sort by Price (high to low)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    await expect(inventoryPage.activeSort).toHaveText('Price (high to low)');
    const prices = await inventoryPage.priceValues();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('INV-07 sort goes back to A to Z after a reload', async ({ page, inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    await page.reload();

    await expect(inventoryPage.activeSort).toHaveText('Name (A to Z)');
    await expect(inventoryPage.names).toHaveText(NAMES_A_TO_Z);
  });

  test('INV-08 add one product to the cart', { tag: '@smoke' }, async ({ header, inventoryPage }) => {
    await inventoryPage.add(PRODUCTS.backpack);

    await expect(inventoryPage.removeButton(PRODUCTS.backpack)).toHaveText('Remove');
    await expect(inventoryPage.addButton(PRODUCTS.backpack)).toBeHidden();
    await expect(header.cartBadge).toHaveText('1');
  });

  test('INV-09 add every product to the cart', async ({ header, inventoryPage }) => {
    await inventoryPage.add(...ALL_PRODUCTS);

    await expect(header.cartBadge).toHaveText(String(ALL_PRODUCTS.length));
    for (const product of ALL_PRODUCTS) {
      await expect(inventoryPage.removeButton(product)).toBeVisible();
    }
  });

  test('INV-10 remove a product from the products page', async ({ header, inventoryPage }) => {
    await inventoryPage.add(PRODUCTS.backpack, PRODUCTS.onesie);
    await inventoryPage.removeButton(PRODUCTS.onesie).click();

    await expect(header.cartBadge).toHaveText('1');
    await expect(inventoryPage.addButton(PRODUCTS.onesie)).toHaveText('Add to cart');
    await expect(inventoryPage.removeButton(PRODUCTS.backpack)).toBeVisible();
  });

  test('INV-11 the badge disappears when the cart becomes empty', async ({ header, inventoryPage }) => {
    await inventoryPage.add(PRODUCTS.backpack);
    await inventoryPage.removeButton(PRODUCTS.backpack).click();

    await expect(header.cartBadge).toBeHidden();
  });

  test('INV-12 the cart is kept after a reload', async ({ page, header, inventoryPage, cartStorage }) => {
    await inventoryPage.add(PRODUCTS.backpack, PRODUCTS.onesie);
    await page.reload();

    await expect(header.cartBadge).toHaveText('2');
    await expect(inventoryPage.removeButton(PRODUCTS.backpack)).toBeVisible();
    await expect(inventoryPage.removeButton(PRODUCTS.onesie)).toBeVisible();
    expect(await cartStorage.ids()).toEqual([PRODUCTS.backpack.id, PRODUCTS.onesie.id]);
  });

  test('INV-13 product name opens its details page', async ({ page, inventoryPage, productPage }) => {
    await inventoryPage.titleLink(PRODUCTS.fleeceJacket).click();

    await expect(page).toHaveURL(`/inventory-item.html?id=${PRODUCTS.fleeceJacket.id}`);
    await expect(productPage.name).toHaveText(PRODUCTS.fleeceJacket.name);
  });

  test('INV-14 product image opens its details page', async ({ page, inventoryPage, productPage }) => {
    await inventoryPage.imageLink(PRODUCTS.bikeLight).click();

    await expect(page).toHaveURL(`/inventory-item.html?id=${PRODUCTS.bikeLight.id}`);
    await expect(productPage.name).toHaveText(PRODUCTS.bikeLight.name);
  });

  test('INV-15 added products stay added after sorting', async ({ header, inventoryPage }) => {
    await inventoryPage.add(PRODUCTS.backpack, PRODUCTS.onesie);
    await inventoryPage.sortBy('hilo');

    await expect(inventoryPage.removeButton(PRODUCTS.backpack)).toBeVisible();
    await expect(inventoryPage.removeButton(PRODUCTS.onesie)).toBeVisible();
    await expect(header.cartBadge).toHaveText('2');
  });
});
