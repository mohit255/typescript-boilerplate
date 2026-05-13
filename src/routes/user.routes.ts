import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { createUserSchema } from '../validation/user.validation';
// import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.get('/', UserController.getAllUsers);

export default router;
