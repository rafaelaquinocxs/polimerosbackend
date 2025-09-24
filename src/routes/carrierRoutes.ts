import { Router } from 'express';
import {
  getCarriers,
  getCarrierById,
  createCarrier,
  updateCarrier,
  deleteCarrier
} from '../controllers/carrierController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas de transportadoras requerem autenticação
router.use(authenticateToken);

router.get('/', getCarriers);
router.get('/:id', getCarrierById);
router.post('/', createCarrier);
router.put('/:id', updateCarrier);
router.delete('/:id', deleteCarrier);

export default router;
