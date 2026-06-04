const SET_COOKIE_CONFIG = {
  httpOnly: true,
  secure: false, // development
  sameSite: "strict",
  path: "/",
};

const CLEAR_COOKIE_CONFIG = {
  httpOnly: true,
  secure: true, // If I mistakenly set this to true during clear
  sameSite: "strict",
  path: "/",
};

// Based on Express documentation, clearCookie options must match the options used to set the cookie.
// Let's verify if Express ignores 'secure' if it's set to true in clearCookie but the original was false
// Actually, Express documentation says:
// res.clearCookie(name [, options])
// "When you create the cookie, you must set the same path and domain options that you used when you set the cookie."
// It doesn't explicitly state 'secure' must match, but it's good practice.
