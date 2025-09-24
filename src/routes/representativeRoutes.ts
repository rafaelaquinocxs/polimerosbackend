import { Router } from 'express';
import {
  getRepresentatives,
  getRepresentativeById,
  createRepresentative,
  updateRepresentative,
  deleteRepresentative
} from '../controllers/representativeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas de representadas requerem autenticação
router.use(authenticateToken);

router.get('/', getRepresentatives);
router.get('/:id', getRepresentativeById);
router.post('/', createRepresentative);
router.put('/:id', updateRepresentative);
router.delete('/:id', deleteRepresentative);

export default router;
