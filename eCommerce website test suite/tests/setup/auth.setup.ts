import { test as setup, expect } from '../../fixtures/test';
import { PASSWORD, STANDARD_USER_STATE, USERS } from '../../test-data/users';

// Logs in once and saves the session cookie, so other tests start already logged in
setup('log in as standard_user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(USERS.standard, PASSWORD);
  await expect(page).toHaveURL('/inventory.html');

  await page.context().storageState({ path: STANDARD_USER_STATE });
});
