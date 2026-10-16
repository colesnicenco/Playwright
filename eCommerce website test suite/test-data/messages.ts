export const LOGIN_ERRORS = {
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  noMatch: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  notLoggedIn: (path: string) => `Epic sadface: You can only access '${path}' when you are logged in.`,
};

export const CHECKOUT_ERRORS = {
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
};

export const CHECKOUT_TEXT = {
  payment: 'SauceCard #31337',
  shipping: 'Free Pony Express Delivery!',
  completeHeader: 'Thank you for your order!',
  completeText: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
};

/** Pages that can only be opened while logged in */
export const PROTECTED_PATHS = [
  '/inventory.html',
  '/inventory-item.html?id=1',
  '/cart.html',
  '/checkout-step-one.html',
  '/checkout-step-two.html',
  '/checkout-complete.html',
  '/dynamic-catalog-lazy-load.html',
  '/dynamic-catalog-spinner.html',
  '/dynamic-catalog-slider.html',
];
