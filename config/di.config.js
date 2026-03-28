import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';

// Customer repositories and services
import { CustomerOrderRepository } from '../repositories/customer/customer-order.repository.js';
import { CustomerProductRepository } from '../repositories/customer/customer-product.repository.js';
import { CustomerOrderService } from '../services/customer/customer-order.service.js';
import { CustomerProductService } from '../services/customer/customer-product.service.js';

// Staff repositories and services
import { StaffOrderRepository } from '../repositories/staff/staff-order.repository.js';
import { StaffProductRepository } from '../repositories/staff/staff-product.repository.js';
import { StaffOrderService } from '../services/staff/staff-order.service.js';
import { StaffProductService } from '../services/staff/staff-product.service.js';
import { StaffDeliveryService } from '../services/staff/staff-delivery.service.js';

// Admin repositories and services
import { AdminStoreRepository } from '../repositories/admin/admin-store.repository.js';
import { AdminStaffRepository } from '../repositories/admin/admin-staff.repository.js';
import { AdminOrderRepository } from '../repositories/admin/admin-report.repository.js';
import { AdminStoreService } from '../services/admin/admin-store.service.js';
import { AdminStaffService } from '../services/admin/admin-staff.service.js';
import { AdminReportService } from '../services/admin/admin-report.service.js';

// Controllers
import { CustomerOrderController } from '../controllers/customer/customer-order.controller.js';
import { CustomerProductController } from '../controllers/customer/customer-product.controller.js';
import { StaffOrderController } from '../controllers/staff/staff-order.controller.js';
import { StaffProductController } from '../controllers/staff/staff-product.controller.js';
import { StaffDeliveryController } from '../controllers/staff/staff-delivery.controller.js';
import { AdminStoreController } from '../controllers/admin/admin-store.controller.js';
import { AdminStaffController } from '../controllers/admin/admin-staff.controller.js';
import { AdminReportController } from '../controllers/admin/admin-report.controller.js';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); 

// Auth dependencies
const userRepository = new UserRepository(prisma.user);
const authService = new AuthService(prisma, userRepository);
const authController = new AuthController(authService);

// Customer dependencies
const customerOrderRepository = new CustomerOrderRepository(prisma.order);
const customerProductRepository = new CustomerProductRepository(prisma.product);
const customerOrderService = new CustomerOrderService(prisma, customerOrderRepository);
const customerProductService = new CustomerProductService(prisma, customerProductRepository);

// Staff dependencies
const staffOrderRepository = new StaffOrderRepository(prisma.order);
const staffProductRepository = new StaffProductRepository(prisma.product);
const staffOrderService = new StaffOrderService(prisma, staffOrderRepository);
const staffProductService = new StaffProductService(prisma, staffProductRepository);
const staffDeliveryService = new StaffDeliveryService(prisma, null);

// Admin dependencies
const adminStoreRepository = new AdminStoreRepository(prisma.store);
const adminStaffRepository = new AdminStaffRepository(prisma.staff);
const adminOrderRepository = new AdminOrderRepository(prisma.order);
const adminStoreService = new AdminStoreService(prisma, adminStoreRepository);
const adminStaffService = new AdminStaffService(prisma, adminStaffRepository, userRepository);
const adminReportService = new AdminReportService(prisma, adminOrderRepository, customerProductRepository);

// Customer Controllers
const customerOrderController = new CustomerOrderController(customerOrderService);
const customerProductController = new CustomerProductController(customerProductService, null);

// Staff Controllers
const staffOrderController = new StaffOrderController(staffOrderService);
const staffProductController = new StaffProductController(staffProductService);
const staffDeliveryController = new StaffDeliveryController(staffDeliveryService);

// Admin Controllers
const adminStoreController = new AdminStoreController(adminStoreService);
const adminStaffController = new AdminStaffController(authService, adminStaffService);
const adminReportController = new AdminReportController(adminReportService);

export { 
  prisma, 
  userRepository, 
  authService, 
  authController,
  // Customer
  customerOrderRepository,
  customerProductRepository,
  customerOrderService,
  customerProductService,
  // Staff
  staffOrderRepository,
  staffProductRepository,
  staffOrderService,
  staffProductService,
  staffDeliveryService,
  // Admin
  adminStoreRepository,
  adminStaffRepository,
  adminOrderRepository,
  adminStoreService,
  adminStaffService,
  adminReportService,
  // Customer Controllers
  customerOrderController,
  customerProductController,
  // Staff Controllers
  staffOrderController,
  staffProductController,
  staffDeliveryController,
  // Admin Controllers
  adminStoreController,
  adminStaffController,
  adminReportController
};