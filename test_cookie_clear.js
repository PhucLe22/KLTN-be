import { CookieHelper } from './lib/cookieHelper.js';

const mockRes = {
  cookieName: null,
  cookieValue: null,
  cookieOptions: null,
  cookie(name, value, options) {
    this.cookieName = name;
    this.cookieValue = value;
    this.cookieOptions = options;
  },
  clearedCookieName: null,
  clearedCookieOptions: null,
  clearCookie(name, options) {
    this.clearedCookieName = name;
    this.clearedCookieOptions = options;
  }
};

CookieHelper.clearRefreshToken(mockRes);
console.log('Cleared cookie name:', mockRes.clearedCookieName);
console.log('Cleared cookie options:', mockRes.clearedCookieOptions);
