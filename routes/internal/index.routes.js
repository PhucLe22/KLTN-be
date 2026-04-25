import express from 'express';
const staffRouter = express.Router();
import { protect } from '../../middlewares/authentication.middleware.js';
import { restrictTo } from '../../middlewares/authorize.middleware.js';

// Import order routes
import orderRouter from './order.routes.js';

// All staff routes require authentication and staff roles
staffRouter.use(protect, restrictTo('ADMIN', 'MANAGER', 'CASHIER', 'STAFF', 'KITCHEN'));

staffRouter.use('/orders', orderRouter);

export default staffRouter;