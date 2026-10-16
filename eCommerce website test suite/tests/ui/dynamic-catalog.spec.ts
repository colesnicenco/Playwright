import { test, expect } from '../../fixtures/test';
import { ALL_PRODUCTS, formatPrice } from '../../test-data/products';

// Lazy Load names some products with a size, e.g. "Sauce Labs Fleece Jacket (M)"
const SIZE_SUFFIX = / \((XS|S|M|L|XL|XXL)\)$/;

function productNamed(name: string) {
  return ALL_PRODUCTS.find((product) => product.name === name.replace(SIZE_SUFFIX, ''));
}

test.describe('Dynamic Catalog: Spinner', () => {
  test('DYN-01 the spinner shows, then the products load', async ({ header, spinnerPage }) => {
    await spinnerPage.goto();

    await expect(header.title).toHaveText('Dynamic Catalog - Spinner');
    await expect(spinnerPage.spinner).toBeVisible();
    // Loading takes about 3.5 s on purpose
    await expect(spinnerPage.spinner).toBeHidden({ timeout: 15_000 });
    await expect(spinnerPage.names).toHaveCount(ALL_PRODUCTS.length);
    await expect(spinnerPage.prices).toHaveCount(ALL_PRODUCTS.length);
    await expect(spinnerPage.images).toHaveCount(ALL_PRODUCTS.length);
  });

  test('DYN-02 the loaded products have the right names and prices', async ({ spinnerPage }) => {
    await spinnerPage.goto();
    await expect(spinnerPage.names).toHaveCount(ALL_PRODUCTS.length, { timeout: 15_000 });

    const names = await spinnerPage.names.allTextContents();
    const prices = await spinnerPage.prices.allTextContents();
    expect([...names].sort()).toEqual(ALL_PRODUCTS.map((product) => product.name).sort());
    names.forEach((name, i) => {
      expect.soft(prices[i], name).toBe(formatPrice(productNamed(name)!.priceCents));
    });
  });
});

test.describe('Dynamic Catalog: Lazy Load', () => {
  test.beforeEach(async ({ lazyLoadPage }) => {
    await lazyLoadPage.goto();
  });

  test('DYN-03 the first products load, followed by placeholders', async ({ header, lazyLoadPage }) => {
    await expect(header.title).toHaveText('Dynamic Catalog - Lazy Load');
    await expect(lazyLoadPage.names.first()).toBeVisible();
    await expect(lazyLoadPage.placeholders.first()).toHaveText('Loading…');
  });

  test('DYN-04 scrolling loads more products', async ({ page, lazyLoadPage }) => {
    await expect(lazyLoadPage.names.first()).toBeVisible();
    const initialCount = await lazyLoadPage.names.count();

    // Keep scrolling until more cards appear
    await expect
      .poll(
        async () => {
          await page.mouse.wheel(0, 3000);
          return lazyLoadPage.names.count();
        },
        { timeout: 20_000 },
      )
      .toBeGreaterThan(initialCount);
  });

  test('DYN-05 every card has an image, a known product name and its price', async ({ lazyLoadPage }) => {
    await expect(lazyLoadPage.names.first()).toBeVisible();

    // Cards keep loading while the test runs, so read them all in one go from the page
    const cards = await lazyLoadPage.names.evaluateAll((names) =>
      names.map((name) => {
        const card = name.parentElement!;
        return {
          name: name.textContent ?? '',
          price: card.querySelector('[data-test$="-price"]')?.textContent ?? '',
          hasImage: card.querySelector('img') !== null,
        };
      }),
    );

    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const product = productNamed(card.name);
      expect.soft(product, `"${card.name}" is a known product`).toBeDefined();
      expect.soft(card.hasImage, `"${card.name}" has an image`).toBe(true);
      if (product) expect.soft(card.price, card.name).toBe(formatPrice(product.priceCents));
    }
  });
});

test.describe('Dynamic Catalog: Slider', () => {
  // Order of the slides, which is not the order of the products page
  const SLIDES = [
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt',
    'Sauce Labs Onesie',
    'Test.allTheThings() T-Shirt (Red)',
    'Sauce Labs Backpack',
    'Sauce Labs Fleece Jacket',
  ];

  test.beforeEach(async ({ sliderPage }) => {
    await sliderPage.goto();
  });

  test('DYN-06 the slider starts on the first product', async ({ header, sliderPage }) => {
    await expect(header.title).toHaveText('Dynamic Catalog - Slider');
    await expect(sliderPage.name).toHaveText(SLIDES[0]);
    await expect(sliderPage.dots).toHaveCount(SLIDES.length);
    await expect(sliderPage.dot(0)).toHaveClass(/active/);
  });

  test('DYN-07 clicking a dot shows that product', async ({ sliderPage }) => {
    await sliderPage.dot(4).click();

    await expect(sliderPage.name).toHaveText(SLIDES[4]);
    await expect(sliderPage.price).toHaveText(formatPrice(productNamed(SLIDES[4])!.priceCents));
    await expect(sliderPage.dot(4)).toHaveClass(/active/);
    await expect(sliderPage.dot(0)).not.toHaveClass(/active/);
  });

  test('DYN-08 the slider moves on by itself', async ({ sliderPage }) => {
    await expect(sliderPage.name).toHaveText(SLIDES[0]);
    await expect(sliderPage.name).not.toHaveText(SLIDES[0], { timeout: 15_000 });
  });

  test('DYN-09 every dot has an accessible name', async ({ sliderPage }) => {
    for (const [i, name] of SLIDES.entries()) {
      await expect(sliderPage.dot(i)).toHaveAttribute('aria-label', `Show ${name}`);
    }
  });
});
