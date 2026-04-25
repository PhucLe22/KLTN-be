import { orderService } from '../services/order.service.js';
import { OK } from '../lib/successResponse.js';

class InternalController {
  /**
   * Get orders for staff based on role
   * - ADMIN: Can view all orders
   * - MANAGER: Can view orders by store_id
   * - STAFF: Can view orders by store_id
   */
  async getOrdersForStaff(req, res, next) {
    try {
      const { page = 1, limit = 10, storeId, status } = req.query;
      const user = req.user;

      let filters = {};
      
      // Apply role-based filtering
      if (user.role === 'ADMIN') {
        // Admin can view all orders, optional store filter
        if (storeId) {
          filters.storeId = storeId;
        }
      } else if (user.role === 'MANAGER' || user.role === 'STAFF') {
        // Manager and Staff can only view orders from their store
        filters.storeId = user.storeId;
        
        // Additional check for manager if different storeId is provided
        if (storeId && storeId !== user.storeId) {
          return res.status(403).json({
            status: 'fail',
            message: 'Bạn không có quyền xem đơn hàng của cửa hàng này'
          });
        }
      }

      // Apply status filter if provided
      if (status) {
        filters.status = status;
      }

      const orders = await orderService.getOrdersWithFilters(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return OK(res, {
        orders: orders.data,
        pagination: orders.pagination
      }, 'Lấy danh sách đơn hàng thành công');
    } catch (error) {
      next(error);
    }
  }
}

export default new InternalController();
