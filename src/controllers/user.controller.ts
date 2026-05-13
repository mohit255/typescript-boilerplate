import { Request, Response } from 'express';
import { Database } from '../config/database';
import { User } from '../entities/User';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

export class UserController {
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: A list of users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  public static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const userRepo = Database.getDataSource().getRepository(User);
      const users = await userRepo.find();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
