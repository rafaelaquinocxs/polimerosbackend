import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getDashboardStats
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas de pedidos requerem autenticação
router.use(authenticateToken);

router.get('/dashboard/stats', getDashboardStats);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
