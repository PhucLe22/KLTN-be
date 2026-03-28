// import user from '../models/user.model';
import {BaseController} from './base.controller.js';
import { registerDto } from '../DTOs/register.dto.js';

export class AuthController extends BaseController {
  #IAuthService;

  constructor(authService) {
    super();
    this.#IAuthService = authService;
    // Bind methods to ensure 'this' context is preserved
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }
  
  async register(req, res, next) {
    try {
      const validatedData = registerDto.parse(req.body);
      const user = await this.#IAuthService.register(validatedData);
      return this.created(res, user);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.#IAuthService.login(req.body);
      return this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const {sub: userId} = req.user;
      const user = await this.#IAuthService.getProfile({userId});
      return this.ok(res, user);
    } catch (error) {
      next(error);
    }
  }
}