// Mocking the request and response to verify logic in controllers/auth.controller.js
import { CookieHelper } from './lib/cookieHelper.js';

const mockRes = {
    _headers: {},
    cookie(name, value, options) {
        this._headers[name] = { value, options };
    },
    clearCookie(name, options) {
        this._headers[name] = { cleared: true, options };
    },
    success(res, data) {
        return { data };
    }
};

const mockReq = {
    cookies: {
        refreshToken: 'some-token'
    },
    body: {
        refreshToken: 'some-token'
    }
};

// Simulation of logout
async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    console.log('Token to revoke:', refreshToken);
    // await this.service.logout(refreshToken);
    CookieHelper.clearRefreshToken(res);
    return res.success(res, { message: 'Logout success' });
}

logout(mockReq, mockRes);
console.log('Response state:', mockRes._headers);
