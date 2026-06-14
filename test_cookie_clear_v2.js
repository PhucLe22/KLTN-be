const COOKIE_CONFIG = {
  httpOnly: true,
  secure: false, // Simulating non-production environment
  sameSite: "strict",
  path: "/",
};

const mockRes = {
  clearedCookieName: null,
  clearedCookieOptions: null,
  clearCookie(name, options) {
    this.clearedCookieName = name;
    this.clearedCookieOptions = options;
  }
};

mockRes.clearCookie("refreshToken", COOKIE_CONFIG);

console.log('Cleared cookie name:', mockRes.clearedCookieName);
console.log('Cleared cookie options:', mockRes.clearedCookieOptions);
