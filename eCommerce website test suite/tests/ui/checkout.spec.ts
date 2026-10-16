import { test, expect, type CartStorage } from '../../fixtures/test';
import { type CheckoutInfoPage } from '../../pages/CheckoutInfoPage';
import { ALL_PRODUCTS, PRODUCTS, formatPrice, orderTotals, type Product } from '../../test-data/products';
import { CHECKOUT_ERRORS, CHECKOUT_TEXT } from '../../test-data/messages';
import { CHECKOUT_INFO } from '../../test-data/users';

const BASKET = [PRODUCTS.backpack, PRODUCTS.bikeLight];

test.describe('Checkout step one: Your Information', () => {
  test.beforeEach(async ({ cartStorage, checkoutInfoPage }) => {
    await cartStorage.seed(...BASKET);
    await checkoutInfoPage.goto();
  });

  test('CO-01 the form is shown', async ({ header, checkoutInfoPage }) => {
    await expect(header.title).toHaveText('Checkout: Your Information');
    await expect(checkoutInfoPage.firstName).toHaveAttribute('placeholder', 'First Name');
    await expect(checkoutInfoPage.lastName).toHaveAttribute('placeholder', 'Last Name');
    await expect(checkoutInfoPage.postalCode).toHaveAttribute('placeholder', 'Zip/Postal Code');
    await expect(checkoutInfoPage.cancelButton).toBeVisible();
    await expect(checkoutInfoPage.continueButton).toBeVisible();
  });

  test('CO-02 all fields empty', { tag: '@smoke' }, async ({ page, checkoutInfoPage }) => {
    await checkoutInfoPage.submit({});

    await expect(checkoutInfoPage.error).toHaveText(CHECKOUT_ERRORS.firstNameRequired);
    await expect(page).toHaveURL('/checkout-step-one.html');
  });

  test('CO-03 last name missing', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.submit({ firstName: CHECKOUT_INFO.firstName });
    await expect(checkoutInfoPage.error).toHaveText(CHECKOUT_ERRORS.lastNameRequired);
  });

  test('CO-04 postal code missing', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.submit({ firstName: CHECKOUT_INFO.firstName, lastName: CHECKOUT_INFO.lastName });
    await expect(checkoutInfoPage.error).toHaveText(CHECKOUT_ERRORS.postalCodeRequired);
  });

  test('CO-05 fields with only spaces are rejected', async ({ page, checkoutInfoPage }) => {
    test.fail(true, 'F6: fields containing only spaces are accepted');

    await checkoutInfoPage.submit({ firstName: '   ', lastName: '   ', postalCode: '   ' });

    await expect(checkoutInfoPage.error).toHaveText(CHECKOUT_ERRORS.firstNameRequired, { timeout: 2_000 });
    await expect(page).toHaveURL('/checkout-step-one.html');
  });

  test('CO-06 the error message can be closed', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.submit({});
    await expect(checkoutInfoPage.error).toBeVisible();

    await checkoutInfoPage.errorCloseButton.click();

    await expect(checkoutInfoPage.error).toBeHidden();
  });

  test('CO-07 Cancel returns to the cart', async ({ page, header, checkoutInfoPage }) => {
    await checkoutInfoPage.cancelButton.click();

    await expect(page).toHaveURL('/cart.html');
    await expect(header.cartBadge).toHaveText(String(BASKET.length));
  });

  test('CO-08 valid information continues to the overview', { tag: '@smoke' }, async ({ page, checkoutInfoPage }) => {
    await checkoutInfoPage.submit(CHECKOUT_INFO);
    await expect(page).toHaveURL('/checkout-step-two.html');
  });
});

test.describe('Checkout step two: Overview', () => {
  // Puts the products in the cart and fills in step one, ending on the overview page
  async function openOverview(
    { cartStorage, checkoutInfoPage }: { cartStorage: CartStorage; checkoutInfoPage: CheckoutInfoPage },
    products: Product[],
  ) {
    await cartStorage.seed(...products);
    await checkoutInfoPage.goto();
    await checkoutInfoPage.submit(CHECKOUT_INFO);
  }

  test('CO-09 the overview lists the cart products', { tag: '@smoke' }, async ({ cartStorage, checkoutInfoPage, header, checkoutOverviewPage }) => {
    await openOverview({ cartStorage, checkoutInfoPage }, BASKET);

    await expect(header.title).toHaveText('Checkout: Overview');
    await expect(checkoutOverviewPage.names).toHaveText(BASKET.map((product) => product.name));
    await expect(checkoutOverviewPage.quantities).toHaveText(BASKET.map(() => '1'));
    await expect(checkoutOverviewPage.prices).toHaveText(BASKET.map((product) => formatPrice(product.priceCents)));
  });

  test('CO-10 / CO-11 / CO-12 item total, tax and total are correct', { tag: '@smoke' }, async ({ cartStorage, checkoutInfoPage, checkoutOverviewPage }) => {
    await openOverview({ cartStorage, checkoutInfoPage }, BASKET);
    const totals = orderTotals(BASKET);

    await expect(checkoutOverviewPage.itemTotal).toHaveText(`Item total: ${formatPrice(totals.itemTotal)}`);
    await expect(checkoutOverviewPage.tax).toHaveText(`Tax: ${formatPrice(totals.tax)}`);
    await expect(checkoutOverviewPage.total).toHaveText(`Total: ${formatPrice(totals.total)}`);
  });

  const baskets: Record<string, Product[]> = {
    'one product': [PRODUCTS.onesie],
    'all six products': ALL_PRODUCTS,
    'two products with the same price': [PRODUCTS.boltTShirt, PRODUCTS.redTShirt],
  };
  for (const [label, products] of Object.entries(baskets)) {
    test(`CO-13 totals are correct for ${label}`, async ({ cartStorage, checkoutInfoPage, checkoutOverviewPage }) => {
      await openOverview({ cartStorage, checkoutInfoPage }, products);
      const totals = orderTotals(products);

      await expect(checkoutOverviewPage.itemTotal).toHaveText(`Item total: ${formatPrice(totals.itemTotal)}`);
      await expect(checkoutOverviewPage.tax).toHaveText(`Tax: ${formatPrice(totals.tax)}`);
      await expect(checkoutOverviewPage.total).toHaveText(`Total: ${formatPrice(totals.total)}`);
    });
  }

  test('CO-14 payment and shipping information', async ({ cartStorage, checkoutInfoPage, checkoutOverviewPage }) => {
    await openOverview({ cartStorage, checkoutInfoPage }, BASKET);

    await expect(checkoutOverviewPage.paymentInfo).toHaveText(CHECKOUT_TEXT.payment);
    await expect(checkoutOverviewPage.shippingInfo).toHaveText(CHECKOUT_TEXT.shipping);
  });

  test('CO-15 Cancel returns to the products page and keeps the cart', async ({ page, cartStorage, checkoutInfoPage, header, checkoutOverviewPage }) => {
    await openOverview({ cartStorage, checkoutInfoPage }, BASKET);

    await checkoutOverviewPage.cancelButton.click();

    await expect(page).toHaveURL('/inventory.html');
    await expect(header.cartBadge).toHaveText(String(BASKET.length));
  });

  test('CO-19 the overview cannot be opened without filling in step one', async ({ page, cartStorage, checkoutOverviewPage }) => {
    test.fail(true, 'F7: /checkout-step-two.html opens directly by URL');

    await cartStorage.seed(...BASKET);
    await checkoutOverviewPage.goto();

    await expect(page).toHaveURL('/checkout-step-one.html', { timeout: 2_000 });
  });
});

test.describe('Checkout step three: Complete', () => {
  test.beforeEach(async ({ cartStorage, checkoutInfoPage, checkoutOverviewPage }) => {
    await cartStorage.seed(...BASKET);
    await checkoutInfoPage.goto();
    await checkoutInfoPage.submit(CHECKOUT_INFO);
    await checkoutOverviewPage.finishButton.click();
  });

  test('CO-16 Finish completes the order', { tag: '@smoke' }, async ({ page, header, checkoutCompletePage }) => {
    await expect(page).toHaveURL('/checkout-complete.html');
    await expect(header.title).toHaveText('Checkout: Complete!');
    await expect(checkoutCompletePage.header).toHaveText(CHECKOUT_TEXT.completeHeader);
    await expect(checkoutCompletePage.text).toHaveText(CHECKOUT_TEXT.completeText);
    await expect(checkoutCompletePage.image).toBeVisible();
  });

  test('CO-17 the cart is empty after the order', { tag: '@smoke' }, async ({ header, cartStorage }) => {
    await expect(header.cartBadge).toBeHidden();
    expect(await cartStorage.ids()).toEqual([]);
  });

  test('CO-18 Back Home returns to an empty products page', async ({ page, checkoutCompletePage, inventoryPage }) => {
    await checkoutCompletePage.backHomeButton.click();

    await expect(page).toHaveURL('/inventory.html');
    for (const product of BASKET) {
      await expect(inventoryPage.addButton(product)).toBeVisible();
    }
  });
});
