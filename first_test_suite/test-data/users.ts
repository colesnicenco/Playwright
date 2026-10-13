// Credentials listed on the saucedemo.com login page
export const PASSWORD = 'secret_sauce';

export const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

// Order matches the "Accepted usernames are:" list on the login page
export const ALL_USERNAMES = [
  USERS.standard,
  USERS.lockedOut,
  USERS.problem,
  USERS.performanceGlitch,
  USERS.error,
  USERS.visual,
];

export const VALID_USERNAMES = ALL_USERNAMES.filter((username) => username !== USERS.lockedOut);

/** Session saved by tests/setup/auth.setup.ts and reused by the logged-in tests (gitignored) */
export const STANDARD_USER_STATE = 'playwright/.auth/standard_user.json';

export const CHECKOUT_INFO = {
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345',
};
