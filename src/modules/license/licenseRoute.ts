import { Router } from 'express';
import { AuthGuard } from '../../middleware/authGuard';
import { LicenseController } from './licenseController';
import multer from 'multer';

const router = Router();

router.get('/', LicenseController.getList);
router.get('/:id', LicenseController.getOne);
router.post('/', AuthGuard.verifyToken, LicenseController.create);

router.patch('/:id', AuthGuard.verifyToken, LicenseController.update);

router.delete('/:id', AuthGuard.verifyToken, LicenseController.remove);

export default router;
