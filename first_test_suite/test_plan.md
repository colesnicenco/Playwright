# Test plan – Swag Labs (saucedemo.com)

| | |
|---|---|
| **Application** | https://www.saucedemo.com/ |
| **Explored as** | `standard_user` / `secret_sauce` |
| **Explored on** | 2026-10-12, Chromium, via Playwright MCP |
| **Status** | Implemented: 132 tests, all passing (5 of them known-bug tests, see section 3) |
| **Framework** | Playwright Test + TypeScript |

## 1. Scope

**In scope:** every page reachable after logging in as `standard_user`. That means login and logout, the product list, product details, the cart, the three checkout steps, the side menu, the three Dynamic Catalog pages, the footer, and the protection of pages that need a login.

**Out of scope for now:**
- the special behaviour of `problem_user`, `error_user`, `performance_glitch_user` and `visual_user` after login (see section 7);
- external sites the app links to (saucelabs.com and the social networks). We only check that the links are correct, not those sites;
- load testing and security testing.

---

## 2. Site map

| Page | URL | Reached from |
|---|---|---|
| Login | `/` | Start, Logout |
| Products | `/inventory.html` | Login, "All Items", "Back to products", "Continue Shopping", "Back Home" |
| Product details | `/inventory-item.html?id=<0-5>` | Product name or image |
| Cart | `/cart.html` | Cart icon |
| Checkout: Your Information | `/checkout-step-one.html` | Cart → Checkout |
| Checkout: Overview | `/checkout-step-two.html` | Step one → Continue |
| Checkout: Complete! | `/checkout-complete.html` | Overview → Finish |
| Dynamic Catalog – Lazy Load | `/dynamic-catalog-lazy-load.html` | Menu → Dynamic Catalog → Lazy Load |
| Dynamic Catalog – Spinner | `/dynamic-catalog-spinner.html` | Menu → Dynamic Catalog → Spinner |
| Dynamic Catalog – Slider | `/dynamic-catalog-slider.html` | Menu → Dynamic Catalog → Slider |

On every page after login:
- the **header** has the menu button, the "Swag Labs" logo, and the cart icon with a count badge;
- the **footer** has X, Facebook and LinkedIn links plus the copyright line.

### Reference data

**Products** (the id is from the details page URL):

| id | Name | Price |
|---|---|---|
| 4 | Sauce Labs Backpack | $29.99 |
| 0 | Sauce Labs Bike Light | $9.99 |
| 1 | Sauce Labs Bolt T-Shirt | $15.99 |
| 5 | Sauce Labs Fleece Jacket | $49.99 |
| 2 | Sauce Labs Onesie | $7.99 |
| 3 | Test.allTheThings() T-Shirt (Red) | $15.99 |

**Sort options:** `az` Name (A to Z), the default; `za` Name (Z to A); `lohi` Price (low to high); `hilo` Price (high to low).

**Checkout:**
- tax is **8%** of the item total, rounded to the cent. Example: $39.98 → tax $3.20 → total $43.18;
- the payment line is always `SauceCard #31337`;
- the shipping line is always `Free Pony Express Delivery!`.

**Error messages:**

| Situation | Message |
|---|---|
| Username empty | `Epic sadface: Username is required` |
| Password empty | `Epic sadface: Password is required` |
| Wrong username or password | `Epic sadface: Username and password do not match any user in this service` |
| Locked-out user | `Epic sadface: Sorry, this user has been locked out.` |
| Protected page while logged out | `Epic sadface: You can only access '<path>' when you are logged in.` |
| Checkout, first name empty | `Error: First Name is required` |
| Checkout, last name empty | `Error: Last Name is required` |
| Checkout, postal code empty | `Error: Postal Code is required` |

**State:**
- the login session is a cookie named `session-username`;
- the cart is saved in `localStorage` under `cart-contents`, as a list of product ids such as `[2,5]`.

---
## 3. Findings from exploration

These are possible defects. Each test for one of them asserts the **expected** behaviour and is marked `test.fail(true, 'F<n>: …')`. Playwright then reports the test as passed *while the bug exists*. If the bug is fixed, the test unexpectedly passes and Playwright reports it as a **failure**. That tells you to remove the `test.fail` line.

| # | Finding | Expected | Test |
|---|---|---|---|
| F1 | **You can check out with an empty cart.** Checkout opens step one with nothing in the cart, and the order can be finished. | The Checkout button is disabled, or an error is shown. | CART-07 |
| F2 | **Reset App State doesn't reset the product buttons.** The cart badge clears, but products already added still show "Remove" until the page is reloaded. | All buttons show "Add to cart" right away. | MENU-06 |
| F3 | **The menu stays open after Reset App State.** | Possibly intended. Clarify. | not tested |
| F4 | **The postal code isn't validated.** Any value is accepted, e.g. `1`. | Clarify the rules. Until then, only "required" is tested. | not tested |
| F5 | **A product that doesn't exist can be added to the cart.** `?id=999` shows an "ITEM NOT FOUND" page whose Add to cart button puts `999` in the cart and shows badge "1". | Adding a nonexistent item isn't possible. | PD-07b |
| F6 | **Fields containing only spaces pass checkout validation.** | Treated as empty: "First Name is required". | CO-05 |
| F7 | **The checkout overview opens straight from its URL**, without filling in step one. | Redirect back to step one. | CO-19 |

Notes for whoever writes the tests:
- `[data-test="open-menu"]` is an image covered by the real button, so clicking it times out. Use `page.getByRole('button', { name: 'Open Menu' })` instead.
- The menu's links count as "visible" to Playwright even while the menu is closed, because it slides off-screen instead of hiding. Read whether it's open from `aria-hidden` on `.bm-menu-wrap`.
- The URL changes *before* a new page renders, and the products page and details page use the same `data-test` ids. A selector such as `inventory-item-name` can briefly match all 6 product cards, and Playwright's strict mode fails at once instead of retrying. The details page selectors are therefore limited to the `.inventory_details` panel.
- The Spinner page shows `role="status"` (aria-label "Loading") for about 3.5 seconds. Assert with `expect(...)` and its built-in waiting, never `waitForTimeout`.

---

## 4. Framework

### 4.1 Folder structure

```
playwright.config.ts       # base URL, data-test ids, setup project, saved session, reporters
tsconfig.json              # used by `npm run typecheck`
first_test_suite/          # everything below belongs to this suite
  fixtures/
    test.ts                # extended `test`: page objects + CartStorage + LOGGED_OUT
  pages/
    components/Header.ts, SideMenu.ts, Footer.ts   # parts shared by every page
    LoginPage.ts, InventoryPage.ts, ProductPage.ts, CartPage.ts,
    CheckoutInfoPage.ts, CheckoutOverviewPage.ts, CheckoutCompletePage.ts,
    DynamicCatalogPages.ts # LazyLoadPage, SpinnerPage, SliderPage
  test-data/
    users.ts               # usernames, password, checkout info, session file path
    products.ts            # products, prices in cents, tax, price helpers
    messages.ts            # error and confirmation texts, protected URLs
  tests/
    setup/auth.setup.ts    # logs in once, saves the session
    auth/                  # tests that start LOGGED OUT
      login.spec.ts
      auth-guard.spec.ts
    ui/                    # page-level functional tests, start LOGGED IN
      inventory.spec.ts, product-details.spec.ts, cart.spec.ts, checkout.spec.ts,
      menu.spec.ts, dynamic-catalog.spec.ts, layout.spec.ts
    e2e/                   # full user journeys through the real UI
      purchase.spec.ts
```

The config files stay in the project root, where npm and Playwright look for them. `testDir` in `playwright.config.ts` points to `first_test_suite/tests`. **In the rest of this document, paths such as `tests/ui/cart.spec.ts` or `test-data/products.ts` are relative to `first_test_suite/`.**

### 4.2 Why these folders, and no API or component folders

- **`auth/`** holds tests about getting in: the login form, and what happens when you're *not* logged in. They have to start with no session, so each file has `test.use({ storageState: LOGGED_OUT })`.
- **`ui/`** holds one spec per page or feature. Each test checks one behaviour, starts already logged in, and sets up the state it needs directly (e.g. putting products in the cart through `localStorage`). This keeps the tests short and independent.
- **`e2e/`** holds long journeys that a real user would take, from the login form to the order confirmation, done only through the UI. They're slower and overlap with `ui/`, but they prove the pieces work *together*.
- **No `api/` folder:** Swag Labs has no backend API. The pages are static files, logging in only sets a cookie in the browser, and the cart lives in `localStorage`. There are no requests to test.
- **No component tests:** Playwright component testing mounts a single React component from the app's **source code**. We only have the deployed site, so it's not possible. The page objects in `pages/components/` are not component tests. They're reusable descriptions of the parts that appear on every page.

### 4.3 How the pieces work

- **Login once.** The `setup` project in `playwright.config.ts` runs `tests/setup/auth.setup.ts` first. It logs in as `standard_user` and saves the session cookie to `playwright/.auth/standard_user.json`, which is gitignored. The `chromium` project depends on `setup` and loads that file into every test (`storageState`), so tests in `ui/` open pages already logged in.
- **`data-test` ids.** `testIdAttribute: 'data-test'` in the config makes `page.getByTestId('cart')` look up `[data-test="cart"]`. The site adds these attributes for testing, so they're more stable than CSS classes or text.
- **Fixtures** (`fixtures/test.ts`). Tests import `test` and `expect` from here instead of from `@playwright/test`. Each page object is a fixture, so a test asks for what it needs by name, e.g. `async ({ cartPage, header }) => …`. `cartStorage` puts products straight into the cart (`seed`) and reads it back (`ids`) through `localStorage`.
- **A fresh cart for each test.** Every test gets a new browser context, so `localStorage` starts empty. No test has to clean up after another.
- **Prices in cents.** `test-data/products.ts` stores prices as whole cents (2999, not 29.99), and `orderTotals()` calculates item total, 8% tax and total from them. Calculating in cents avoids floating-point errors such as `29.99 + 9.99 = 39.980000000000004`. Expected totals are always calculated, never hard-coded.
- **Test ids in titles.** Every test title starts with its id from this plan (e.g. `CO-12`), so a failure in the report leads straight to its row here.
- **Tags.** The P1 tests are tagged `@smoke`.

### 4.4 Running the tests

| Command | What it runs |
|---|---|
| `npm test` | Everything |
| `npm run test:smoke` | The `@smoke` tests (P1) |
| `npm run test:e2e` | Only `first_test_suite/tests/e2e` |
| `npx playwright test cart.spec` | One file (matches by file name) |
| `npx playwright test -g "CO-1"` | Tests whose title matches |
| `npm run typecheck` | TypeScript type-check. Playwright runs TypeScript without checking types. |
| `npm run report` | Opens the last HTML report (`test-results/html-report`) |

---

## 5. Test cases

**Priority:**
- **P1** – a critical path, tagged `@smoke`. Run on every change.
- **P2** – main functionality.
- **P3** – edge cases, layout and content.

**Type:** + positive, − negative, E edge case.

**Status:** ✅ implemented and passing; 🐞 implemented as a known-bug test (`test.fail`, see section 3); ⏸ not implemented.

### 5.1 Login – `tests/auth/login.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| LOG-01 | Login page lists the accepted usernames and password | 6 usernames in the documented order; password `secret_sauce` | P3 | + | ✅ |
| LOG-02 | Each valid user can log in (5 tests) | `/inventory.html`, title "Products", no error | P1 | + | ✅ |
| LOG-03 | Locked-out user is rejected | Locked-out error; stays on `/` | P1 | − | ✅ |
| LOG-04 | Empty username and password | "Username is required" | P2 | − | ✅ |
| LOG-05 | Empty password | "Password is required" | P2 | − | ✅ |
| LOG-06 | Empty username | "Username is required" | P2 | − | ✅ |
| LOG-07 | Wrong password | "do not match" error; stays on `/` | P1 | − | ✅ |
| LOG-08 | Unknown user | "do not match" error | P2 | − | ✅ |
| LOG-09 | Username is case-sensitive | `STANDARD_USER` gets the "do not match" error | P3 | E | ✅ |
| LOG-10 | The error message can be closed | Error and the 2 red field icons disappear | P3 | + | ✅ |
| LOG-11 | Password is hidden | `type="password"` | P3 | + | ✅ |
| LOG-12 | Enter key logs in | Pressing Enter in the password field opens `/inventory.html` | P3 | + | ✅ |
| LOG-13 | Session cookie is created | Cookie `session-username` = `standard_user` | P3 | + | ✅ |

**How the tests work:**
- **Setup:** the file starts logged out. `beforeEach` opens the login page. `loginPage.login(user, password)` fills only the fields it's given, so an empty string means "leave the field empty". That lets LOG-04 to LOG-06 reuse the same method.
- **LOG-01** reads the credentials text with `loginPage.readList()`, which splits the block into lines and drops the heading. `expect.soft` checks each username separately, so a report lists *every* missing user. A final `toEqual` fails if a user is added or removed, or if the order changes.
- **LOG-02** is a `for` loop that generates one test per valid user, so each user gets its own result. It first waits for the URL, then for the "Products" title. The title check has a 15-second timeout because `performance_glitch_user` changes the URL straight away but takes about 5 seconds to render the page.
- **LOG-03, LOG-07** check the exact error text *and* that the URL is still `/`. That proves the user wasn't let in, not just that some message appeared.
- **LOG-09** reuses the real username in uppercase (`USERS.standard.toUpperCase()`), so it stays correct if the username changes.
- **LOG-10** counts the red icons in the fields (`fieldErrorIcons`) before and after closing the error, which checks that both disappear.
- **LOG-12** presses Enter instead of clicking Login. Keyboard users and some password managers submit this way.
- **LOG-13** reads the browser context's cookies and uses `expect.objectContaining` to match only the name and value, ignoring expiry and domain.

### 5.2 Pages that need a login – `tests/auth/auth-guard.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| AUTH-01 | Each of the 9 protected pages, opened while logged out (9 tests) | Login form with `You can only access '<path>' when you are logged in.`; no header | P1 | − | ✅ |
| AUTH-02 | Back button after logout | "only access" error; no products shown | P2 | − | ✅ |
| AUTH-03 | Deleting the session cookie logs you out | After a reload, the "only access" error | P3 | E | ✅ |

**How the tests work:**
- **AUTH-01** loops over `PROTECTED_PATHS` from `test-data/messages.ts`. The app names the page *without* its query string (`/inventory-item.html`, not `?id=1`), so the test strips it with `path.split('?')[0]`. Checking that the cart icon is hidden proves the logged-in page didn't render behind the message.
- **AUTH-02** logs in through the form, logs out through the menu, then calls `page.goBack()`. It checks the error *and* that there are 0 product cards, so cached content wasn't shown.
- **AUTH-03** logs in, then clears the cookies with `page.context().clearCookies()` and reloads. This shows that the cookie is the whole session.

### 5.3 Products page – `tests/ui/inventory.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| INV-01 | Page loads | Title "Products"; 6 products | P1 | + | ✅ |
| INV-02 | Product data is correct | Price, description, image file and alt text match; images not broken | P2 | + | ✅ |
| INV-03 | Default sort is A→Z | "Name (A to Z)"; names alphabetical | P2 | + | ✅ |
| INV-04 | Sort Z→A | Names in reverse alphabetical order | P2 | + | ✅ |
| INV-05 | Sort by price, low to high | Prices ascending | P2 | + | ✅ |
| INV-06 | Sort by price, high to low | Prices descending | P2 | + | ✅ |
| INV-07 | Sort resets after a reload | Back to A→Z | P3 | E | ✅ |
| INV-08 | Add one product | "Remove" button; badge 1 | P1 | + | ✅ |
| INV-09 | Add every product | Badge 6; all buttons "Remove" | P2 | + | ✅ |
| INV-10 | Remove from the products page | Badge 1; button back to "Add to cart" | P2 | + | ✅ |
| INV-11 | Badge disappears at 0 | No badge (not "0") | P2 | E | ✅ |
| INV-12 | Cart survives a reload | Badge 2; buttons "Remove"; `cart-contents` holds both ids | P2 | + | ✅ |
| INV-13 | Product name opens details | Correct URL and product name | P2 | + | ✅ |
| INV-14 | Product image opens details | Same as INV-13 | P3 | + | ✅ |
| INV-15 | Added products stay added after sorting | Same 2 still "Remove"; badge 2 | P3 | E | ✅ |

**How the tests work:**
- **Setup:** the session is already loaded, so `beforeEach` just opens `/inventory.html`.
- **INV-02** uses `test.step` for each product, so the report shows which product failed. It finds a product's card by its exact name (`inventoryPage.item(product)`) and checks the price against the test data. It checks the image's `alt` text and file name, then asks the browser whether the image actually loaded: a broken image has `naturalWidth` 0. `expect.poll` retries this until the image finishes loading.
- **INV-03, INV-04** compare against the names sorted in code (`.sort()`, then `.reverse()`), so the expected order isn't copied from the page under test.
- **INV-05, INV-06** read the prices, convert them to cents and compare them with a sorted copy. This checks the *rule* (ascending or descending) rather than a fixed list, so it stays correct if prices change.
- **INV-08 to INV-11** check the button and the badge, the two signs a user sees. INV-11 makes sure the badge disappears instead of showing "0".
- **INV-12** checks persistence in two ways: what the user sees after a reload, and the raw `localStorage` value through `cartStorage.ids()`. The second also checks the order products were added in.
- **INV-13, INV-14** check the URL contains the right id *and* that the page shows the right name.
- **INV-15** catches a common bug where re-rendering a list (here, by sorting) loses the state of its buttons.

### 5.4 Product details – `tests/ui/product-details.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| PD-01 | Details match the products page (6 tests) | Same name, description, price; correct image | P2 | + | ✅ |
| PD-02 | Add from the details page | "Remove"; badge 1 | P1 | + | ✅ |
| PD-03 | Remove from the details page | "Add to cart"; no badge | P2 | + | ✅ |
| PD-04 | Same state on both pages | The products page shows "Remove" for that product | P2 | + | ✅ |
| PD-05 | Back to products | `/inventory.html` | P2 | + | ✅ |
| PD-06 | Open by URL `?id=0`…`?id=5` (6 tests) | The product matching the id | P3 | + | ✅ |
| PD-07 | Unknown id | "ITEM NOT FOUND" | P3 | E | ✅ |
| PD-07b | A product that doesn't exist can't be added | No badge; cart empty | P3 | − | 🐞 F5 |

**How the tests work:**
- **PD-01** reads the description from the products page first, clicks through, then compares. That checks the two pages agree without hard-coding long description texts. It waits for the details URL before reading the name.
- **The `ProductPage` selectors** are limited to the `.inventory_details` panel (see the notes in section 3). Without that, the name check could briefly match all 6 products on the page being left.
- **PD-04** adds on the details page, goes back, and checks the products page shows the same state. This proves both pages read the same cart.
- **PD-06** gives each product id its own test, so the id → product mapping is checked for all 6.
- **PD-07** records the current behaviour for an unknown id. **PD-07b** states what *should* happen (nothing is added) and is marked `test.fail` until F5 is fixed. Its timeout is 2 seconds so the expected failure doesn't wait the default 5.

### 5.5 Cart – `tests/ui/cart.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| CART-01 | Empty cart | "Your Cart"; QTY and Description headers; no items; no badge | P2 | E | ✅ |
| CART-02 | Cart shows the added products | Names, quantity 1, prices, description | P1 | + | ✅ |
| CART-03 | Remove in the cart | Item gone; badge goes down by 1 | P1 | + | ✅ |
| CART-04 | Remove the last item | List empty; no badge | P2 | E | ✅ |
| CART-05 | Continue Shopping | `/inventory.html`; cart unchanged | P2 | + | ✅ |
| CART-06 | Checkout button | `/checkout-step-one.html` | P1 | + | ✅ |
| CART-07 | Checkout with an empty cart is blocked | Stays on `/cart.html` | P2 | − | 🐞 F1 |
| CART-08 | Item name opens details | That product's details page | P3 | + | ✅ |
| CART-09 | Items listed in the order added | Onesie first, then Backpack | P3 | E | ✅ |

**How the tests work:**
- **CART-02 and CART-09** add products by clicking, as a user would, because they test how adding and the cart work together.
- **CART-03 to CART-08** don't need to test adding, so they put products in the cart with `cartStorage.seed()`, which writes `localStorage` directly. That's faster, and a bug in the products page can't make a cart test fail.
- **CART-02** checks the whole list at once (`toHaveText([...])`), which also checks order and count.
- **CART-07** clicks Checkout with an empty cart and expects to stay on the cart page. The click is wrapped in `.catch()`, so if the bug is fixed by *disabling* the button, the test still reaches its URL check.

### 5.6 Checkout – `tests/ui/checkout.spec.ts`

**Step one – Your Information**

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| CO-01 | The form is shown | Title; 3 fields with their placeholders; Cancel and Continue | P2 | + | ✅ |
| CO-02 | All fields empty | "First Name is required"; stays on step one | P1 | − | ✅ |
| CO-03 | Last name missing | "Last Name is required" | P2 | − | ✅ |
| CO-04 | Postal code missing | "Postal Code is required" | P2 | − | ✅ |
| CO-05 | Fields with only spaces are rejected | "First Name is required" | P3 | E | 🐞 F6 |
| CO-06 | Close the error | Error disappears | P3 | + | ✅ |
| CO-07 | Cancel on step one | `/cart.html`; cart unchanged | P2 | + | ✅ |
| CO-08 | Valid data continues | `/checkout-step-two.html` | P1 | + | ✅ |

**Step two – Overview**

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| CO-09 | Overview lists the cart items | Same names, quantities and prices | P1 | + | ✅ |
| CO-10/11/12 | Item total, tax and total | Sum of prices; 8% tax rounded to the cent; total = sum + tax | P1 | + | ✅ |
| CO-13 | Totals for 3 more baskets (3 tests) | Correct for 1 item, all 6 items, and 2 items with the same price | P2 | + | ✅ |
| CO-14 | Payment and shipping info | "SauceCard #31337"; "Free Pony Express Delivery!" | P3 | + | ✅ |
| CO-15 | Cancel on step two | `/inventory.html`; cart kept | P2 | + | ✅ |
| CO-19 | Overview can't be opened by URL alone | Redirect to step one | P3 | E | 🐞 F7 |

**Step three – Complete**

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| CO-16 | Finish the order | URL, title, "Thank you for your order!", dispatch text, pony image | P1 | + | ✅ |
| CO-17 | Cart emptied after the order | No badge; `cart-contents` empty | P1 | + | ✅ |
| CO-18 | Back Home | `/inventory.html`; buttons show "Add to cart" again | P2 | + | ✅ |

**How the tests work:**
- **Three `describe` blocks, one per step.** Each `beforeEach` puts the same basket (Backpack and Bike Light) in the cart with `cartStorage.seed()` and goes to its step. For step three, `beforeEach` completes the whole order first, so each test only checks the result.
- **`checkoutInfoPage.submit(info)`** fills only the fields it's given, then clicks Continue. `submit({})` leaves everything empty (CO-02), and `submit({ firstName })` leaves the other two empty (CO-03). The fields are checked in order, so each test removes one more missing field.
- **CO-01** checks the placeholders because the fields have no visible labels. The placeholder is what tells the user what to type.
- **`openOverview()`** is a helper in the step-two block. It seeds a basket and fills in step one, so each test can choose its own basket.
- **CO-10/11/12** are one test because the three values come from the same calculation. Expected values come from `orderTotals()` in `test-data/products.ts`, which works in cents and rounds the tax with `Math.round`.
- **CO-13** runs the same checks for baskets that catch different mistakes: one item (no adding), all six (the largest total, $129.94 → tax $10.40, where rounding matters), and two items with the same price (catches duplicates being merged).
- **CO-15** checks that cancelling *keeps* the cart. Losing it would be a bad experience.
- **CO-17** checks the badge and `localStorage`, so the cart is really cleared, not just hidden.
- **CO-05, CO-19** are known-bug tests (F6, F7) with 2-second timeouts.

### 5.7 Side menu – `tests/ui/menu.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| MENU-01 | Open and close the menu | 5 links with the right labels; closes again | P2 | + | ✅ |
| MENU-02 | All Items | From the cart, opens `/inventory.html` | P2 | + | ✅ |
| MENU-03 | About link | `href` = `https://saucelabs.com/` | P3 | + | ✅ |
| MENU-04 | Logout | `/`; login form; `session-username` cookie removed | P1 | + | ✅ |
| MENU-05 | Reset App State empties the cart | No badge; `cart-contents` empty | P2 | + | ✅ |
| MENU-06 | Reset App State resets the buttons | Buttons "Add to cart" without a reload | P2 | − | 🐞 F2 |
| MENU-07 | Dynamic Catalog submenu | Lazy Load, Spinner, Slider | P3 | + | ✅ |
| MENU-08 | Menu opens on every page (9 tests) | Menu opens on each logged-in page | P3 | + | ✅ |

**How the tests work:**
- **`sideMenu.open()` and `close()`** click the menu button, then wait until `.bm-menu-wrap` has `aria-hidden="false"` (or `"true"`). Waiting on this attribute is needed because the links count as "visible" even while the menu is off-screen. It also means a test never clicks a link that's still sliding in.
- **MENU-03** checks the link without opening it. Testing saucelabs.com isn't our job, and an external site would make the test slow and unreliable.
- **MENU-04** checks the URL, the login button, and that the session cookie is gone. The cookie check proves the user is really logged out, not just sent to the login page.
- **MENU-05 and MENU-06** are split on purpose. MENU-05 (the cart is emptied) passes. MENU-06 (the buttons are reset) is the known bug F2. Splitting them means the bug doesn't hide whether the part that works keeps working.
- **MENU-08** loops over every logged-in page and opens the menu on each. The header component is shared, so a broken layout on one page would show up here.

### 5.8 Dynamic Catalog – `tests/ui/dynamic-catalog.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| DYN-01 | Spinner shows, then products | Spinner visible, then hidden; 6 cards with name, price and image | P2 | + | ✅ |
| DYN-02 | Spinner product data | The 6 known names; each with its correct price | P3 | + | ✅ |
| DYN-03 | Lazy Load first batch | Title; cards loaded; a "Loading…" placeholder after them | P2 | + | ✅ |
| DYN-04 | Lazy Load adds more on scroll | Card count grows | P2 | + | ✅ |
| DYN-05 | Lazy Load card content | Every card: a known product (sizes allowed), an image, the right price | P3 | + | ✅ |
| DYN-06 | Slider starts on the first item | "Sauce Labs Bike Light"; 6 dots; dot 0 active | P2 | + | ✅ |
| DYN-07 | Dot changes the slide | Dot 4 shows Backpack and its price; dot 4 active, dot 0 not | P2 | + | ✅ |
| DYN-08 | Slider plays by itself | The slide changes without clicking | P3 | + | ✅ |
| DYN-09 | Dots are accessible | Each dot has `aria-label="Show <product>"` | P3 | + | ✅ |

**How the tests work:**
- **DYN-01** finds the spinner by its accessibility role (`getByRole('status', { name: 'Loading' })`), as a screen reader would. It checks the spinner appears, then waits up to 15 seconds for it to disappear (loading takes about 3.5 seconds). No fixed waits are used.
- **DYN-02** compares the *sorted* list of names with the known products, because this page shows them in a different order. `expect.soft` checks every price and reports all mismatches.
- **Cards on these pages** have numbered ids (`lazy-load-item-7-name`), so the page objects match them by prefix and suffix: `[data-test^="lazy-load-item-"][data-test$="-name"]`.
- **DYN-04** uses `expect.poll`: it scrolls, counts the cards, and repeats until the count is higher than at the start, for up to 20 seconds. This adapts to however fast the page loads.
- **DYN-05** reads every card's name, price and image **in one browser call** (`evaluateAll`). Cards keep loading during the test. Reading names and images separately once gave 8 names but 16 images. Reading everything at once gives a consistent snapshot. Sized variants such as "Fleece Jacket (M)" are matched to their product by removing the size, and must have the same price.
- **DYN-08** first checks the slide is on the first product, then waits up to 15 seconds for the text to change. Playwright retries `not.toHaveText` until it passes, so no fixed wait is needed.
- **DYN-09** checks the dot buttons' `aria-label`s. They have no text, so without the label a screen reader couldn't say what each dot does.

### 5.9 Header and footer – `tests/ui/layout.spec.ts`

| ID | Test case | Expected | Pri | Type | Status |
|---|---|---|---|---|---|
| LAY-01 | Header on every page (9 tests) | Logo "Swag Labs", menu button, cart icon | P3 | + | ✅ |
| LAY-02 | Cart icon opens the cart (2 tests) | `/cart.html` from the products page and from a details page | P2 | + | ✅ |
| LAY-03 | Social links | Correct X, Facebook and LinkedIn URLs; `target="_blank"` | P3 | + | ✅ |
| LAY-04 | Copyright line | `© <current year> Sauce Labs. All Rights Reserved.` | P3 | + | ✅ |
| LAY-05 | Page title | "Swag Labs" | P3 | + | ✅ |

**How the tests work:**
- **LAY-01** loops over all 9 logged-in pages, one test each, so a page that lost its header is named in the report.
- **LAY-03** checks `href` and `target` without opening the social sites, for the same reasons as MENU-03.
- **LAY-04** calculates the year with `new Date().getFullYear()`, so the test doesn't start failing every January.

### 5.10 End-to-end journeys – `tests/e2e/purchase.spec.ts`

| ID | Journey | Pri | Status |
|---|---|---|---|
| E2E-01 | Log in → add 1 product → cart → checkout → finish → Back Home → log out | P1 | ✅ |
| E2E-02 | Log in → sort low to high → add the 2 cheapest → check totals → finish | P1 | ✅ |
| E2E-03 | Log in → add from details → add from list → remove one in the cart → continue shopping → add another → finish | P2 | ✅ |
| E2E-04 | Log in → add 2 → cancel at the overview → swap one product → finish | P2 | ✅ |

**How the tests work:**
- **No saved session.** These tests log in through the real form in `beforeEach` (`storageState: LOGGED_OUT`), and never use `cartStorage.seed()`. Everything happens through the UI, as a user would do it.
- **E2E-01** is split into `test.step`s (add, cart, overview, complete, log out). The HTML report shows each step separately, so a failure points to the stage where it happened.
- **E2E-02** clicks the "Add to cart" buttons on the *first two cards after sorting* instead of naming the products. That proves sorting put the cheapest products first, then checks they were Onesie and Bike Light.
- **E2E-03** mixes every way of changing the cart: details page, list page, removing in the cart, and continuing shopping. The final cart and overview must contain exactly the expected products.
- **E2E-04** checks that cancelling at the overview keeps the cart, that the cart can still be changed afterwards, and that the totals are then recalculated for the new contents.

---

## 6. How the suite runs

| What | How |
|---|---|
| Smoke (P1) | `npm run test:smoke`. 31 tests plus the login setup. |
| Regression | `npm test`. 132 tests plus the login setup, about 20 seconds with 10 workers. |
| Browsers | Only Chromium is set up for now. To add Firefox and WebKit, run `npx playwright install firefox webkit`, then copy the `chromium` project in `playwright.config.ts` with `devices['Desktop Firefox']` and `devices['Desktop Safari']`. |
| CI | `retries: 2`, `workers: 1` and `forbidOnly` turn on when the `CI` environment variable is set. |
| Failures | Screenshot on failure; trace on the first retry. Saved in `test-results/artifacts/`. |
| Reports | Written to `test-results/` on every run: `html-report/` (open with `npm run report`), `results.json` (machine-readable), `junit.xml` (for CI tools such as Jenkins, GitLab or Azure DevOps). The console shows the `list` reporter. |
| Headless | Tests run headless (`headless: true` in the config). Add `--headed` to watch a run, or `--ui` for Playwright's interactive mode. |
| Stability | The whole suite passed 3 times in a row (`--repeat-each=3`, 397 runs). Fixed waits (`waitForTimeout`) aren't used anywhere. |

---

## 7. Future work: the other test users

These users log in successfully but behave differently afterwards. They weren't explored for this plan. Each deserves its own suite, made by running the main cases above as that user and recording what differs.

| User | Known purpose | Suggested approach |
|---|---|---|
| `problem_user` | Deliberately broken UI: wrong images, broken sorting and checkout fields | Run INV, PD and CO as this user and record what fails |
| `error_user` | Some actions fail | Run INV and CO as this user and check how errors are shown |
| `performance_glitch_user` | Slow responses | Check timings, e.g. that login finishes within an agreed limit |
| `visual_user` | Visual differences | Screenshot comparison (`toHaveScreenshot`) against `standard_user` |

Those suites would need one saved session per user: an extra login in `auth.setup.ts` and a project in the config for each.

---

## 8. Summary

| Folder | Spec file | Tests | `@smoke` | Known-bug tests |
|---|---|---|---|---|
| auth | login.spec.ts | 17 | 7 | – |
| auth | auth-guard.spec.ts | 11 | 9 | – |
| ui | inventory.spec.ts | 15 | 2 | – |
| ui | product-details.spec.ts | 18 | 1 | PD-07b |
| ui | cart.spec.ts | 9 | 3 | CART-07 |
| ui | checkout.spec.ts | 19 | 6 | CO-05, CO-19 |
| ui | menu.spec.ts | 16 | 1 | MENU-06 |
| ui | dynamic-catalog.spec.ts | 9 | – | – |
| ui | layout.spec.ts | 14 | – | – |
| e2e | purchase.spec.ts | 4 | 2 | – |
| **Total** | | **132** | **31** | **5** |

The counts are Playwright tests. Several plan rows produce one test per user, page or product (LOG-02, AUTH-01, PD-01, PD-06, CO-13, MENU-08, LAY-01, LAY-02), and CO-10/11/12 is one test. Every case in section 5 is implemented. The only findings without a test are F3 and F4, which wait on a decision about the expected behaviour.
