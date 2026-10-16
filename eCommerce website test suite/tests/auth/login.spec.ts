import { test, expect, LOGGED_OUT } from '../../fixtures/test';
import { ALL_USERNAMES, PASSWORD, USERS, VALID_USERNAMES } from '../../test-data/users';
import { LOGIN_ERRORS } from '../../test-data/messages';

test.use({ storageState: LOGGED_OUT });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('LOG-01 login page lists the accepted usernames and password', async ({ loginPage }) => {
    await expect(loginPage.credentials.locator('h4')).toHaveText('Accepted usernames are:');
    await expect(loginPage.passwordInfo.locator('h4')).toHaveText('Password for all users:');

    const listedUsers = await loginPage.readList(loginPage.credentials);
    for (const username of ALL_USERNAMES) {
      expect.soft(listedUsers, `${username} is listed`).toContain(username);
    }
    // Fails if the page adds or removes a user the tests don't cover
    expect(listedUsers).toEqual(ALL_USERNAMES);

    expect(await loginPage.readList(loginPage.passwordInfo)).toEqual([PASSWORD]);
  });

  for (const username of VALID_USERNAMES) {
    test(`LOG-02 ${username} can log in`, { tag: '@smoke' }, async ({ page, loginPage, header }) => {
      await loginPage.login(username, PASSWORD);

      await expect(page).toHaveURL('/inventory.html');
      // performance_glitch_user changes the URL at once but takes ~5 s to render the page
      await expect(header.title).toHaveText('Products', { timeout: 15_000 });
      await expect(loginPage.error).toBeHidden();
    });
  }

  test('LOG-03 locked_out_user is rejected', { tag: '@smoke' }, async ({ page, loginPage }) => {
    await loginPage.login(USERS.lockedOut, PASSWORD);

    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.lockedOut);
    await expect(page).toHaveURL('/');
  });

  test('LOG-04 empty username and password', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.usernameRequired);
  });

  test('LOG-05 empty password', async ({ loginPage }) => {
    await loginPage.login(USERS.standard, '');
    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.passwordRequired);
  });

  test('LOG-06 empty username', async ({ loginPage }) => {
    await loginPage.login('', PASSWORD);
    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.usernameRequired);
  });

  test('LOG-07 wrong password', { tag: '@smoke' }, async ({ page, loginPage }) => {
    await loginPage.login(USERS.standard, 'wrong_password');

    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.noMatch);
    await expect(page).toHaveURL('/');
  });

  test('LOG-08 unknown user', async ({ loginPage }) => {
    await loginPage.login('unknown_user', PASSWORD);
    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.noMatch);
  });

  test('LOG-09 username is case-sensitive', async ({ loginPage }) => {
    await loginPage.login(USERS.standard.toUpperCase(), PASSWORD);
    await expect(loginPage.error).toHaveText(LOGIN_ERRORS.noMatch);
  });

  test('LOG-10 the error message can be closed', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.fieldErrorIcons).toHaveCount(2);

    await loginPage.errorCloseButton.click();

    await expect(loginPage.error).toBeHidden();
    await expect(loginPage.fieldErrorIcons).toHaveCount(0);
  });

  test('LOG-11 password is hidden while typing', async ({ loginPage }) => {
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('LOG-12 pressing Enter in the password field logs in', async ({ page, loginPage }) => {
    await loginPage.username.fill(USERS.standard);
    await loginPage.password.fill(PASSWORD);
    await loginPage.password.press('Enter');

    await expect(page).toHaveURL('/inventory.html');
  });

  test('LOG-13 logging in creates the session cookie', async ({ page, loginPage }) => {
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL('/inventory.html');

    const cookies = await page.context().cookies();
    expect(cookies).toContainEqual(
      expect.objectContaining({ name: 'session-username', value: USERS.standard }),
    );
  });
});
