const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

export const CookieHelper = {
  setRefreshToken(res, refreshToken) {
    const maxAge =
      (parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS) || 7) *
      24 *
      60 *
      60 *
      1000;

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_CONFIG,
      maxAge,
    });
  },

  clearRefreshToken(res) {
    res.clearCookie("refreshToken", COOKIE_CONFIG);
  },
};
