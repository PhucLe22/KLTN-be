import { IAuthService } from './Interfaces/IAuth.service.js';
import bcrypt from 'bcrypt';
import { BadRequestException, ConflictException } from '../controllers/error.controller.js';
import { generateAccessToken, generateRefreshToken } from "../config/jwt.config.js";

export class AuthService extends IAuthService {
  constructor(prisma, userRepository) {
    super();
    this.prisma = prisma;
    this.userRepo = userRepository;
  }

  async register(data) {
    const existing = await this.userRepo.findOne({
      OR: [{ email: data.email }, { phone: data.phone }].filter(Boolean)
    });
    if (existing) throw new ConflictException("User already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.prisma.$transaction(async (tx) => {
      try {
        const user = await tx.user.create({
          data: {
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            customer: {
              create: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                tier: 'BRONZE'
              }
            }
          },
          include: { customer: true }
        });
        const { password, ...result } = user;
        return result;
      } catch (prismaError) {
        console.error('Prisma Create Error:', prismaError);
        throw prismaError;
      }
    });
  }

  async login({ email, phone, password }) {
    const user = await this.userRepo.findOne({
      where: { OR: [{ email }, { phone }].filter(Boolean) },
      include: { customer: true }
    });

    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException("Invalid credentials or account deactivated");
    }

    const tokens = await this.generateTokens(user);
    return {
      user: { id: user.id, email: user.email, name: user.customer?.name },
      ...tokens
    };
  }

  async generateTokens(user) {
    return {
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user)
    };
  }

  async getProfile(payload) {
    const user = await this.userRepo.findById(payload.userId);
    if (!user || !user.isActive) throw new BadRequestException("User not found");
    const { password, ...result } = user;
    return result;
  }
}