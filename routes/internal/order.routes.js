import express from 'express';
const router = express.Router();

import { orderController } from '../../controllers/order.controller.js';

// Staff endpoints - auth & roles handled at parent router level
router.get('/history', orderController.getOrderHistory);

export default router;