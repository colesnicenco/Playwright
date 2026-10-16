import { test, expect, LOGGED_OUT } from '../../fixtures/test';
import { PASSWORD, USERS } from '../../test-data/users';
import { LOGIN_ERRORS, PROTECTED_PATHS } from '../../test-data/messages';

test.use({ storageState: LOGGED_OUT });

test.describe('Pages that need a login', () => {
  for (const path of PROTECTED_PATHS) {
    test(`AUTH-01 ${path} shows the login form when logged out`, { tag: '@smoke' }, async ({ page, loginPage, header }) => {
      await page.goto(path);

      // The message names the page without its query string
      await expect(loginPage.error).toHaveText(LOGIN_ERRORS.notLoggedIn(path.split('?')[0]));
      await expect(loginPage.loginButton).toBeVisible();
      await expect(header.cartLink).toBeHidden();
    });
  }

  test('AUTH-02 Back after logout does not show the products page', async ({ page, loginPage, sideMenu, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL('/inventory.html');

    await sideMenu.open();
    await sideMenu.logout.click();
    await expect(page).toHaveURL('/');

    await page.goBack();

    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.notLoggedIn('/inventory.html'));
    await expect(inventoryPage.items).toHaveCount(0);
  });

  test('AUTH-03 deleting the session cookie logs the user out', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL('/inventory.html');

    await page.context().clearCookies();
    await page.reload();

    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.notLoggedIn('/inventory.html'));
  });
});
