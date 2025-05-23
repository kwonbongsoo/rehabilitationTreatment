import { FastifyInstance } from 'fastify';
import { MemberController } from '../controllers/memberController';

export const setMemberRoutes = async (app: FastifyInstance) => {
    const memberController = new MemberController();

    app.post('/members/register', memberController.registerUser.bind(memberController));
    app.put('/members/:id', memberController.updateUser.bind(memberController));
    app.get('/members/:id', memberController.getUser.bind(memberController));
    app.delete('/members/:id', memberController.deleteUser.bind(memberController));
    app.post('/members/login', memberController.login.bind(memberController));
};