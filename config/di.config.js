import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); 

const userRepository = new UserRepository(prisma.user);
const authService = new AuthService(prisma, userRepository);
const authController = new AuthController(authService);

export { prisma, userRepository, authService, authController };