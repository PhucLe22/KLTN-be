// services/Interfaces/IAuth.service.js

export class IAuthService {
  async register(dto) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  async login(dto) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  async googleLogin(dto) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  async getMe(userId) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  async forgotPassword(dto) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  async resetPassword(dto) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  async validateUser(payload) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }
}