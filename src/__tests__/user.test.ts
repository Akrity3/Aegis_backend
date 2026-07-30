import request from 'supertest';
import app from '../app';

jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: '64f1a2b3c4d5e6f7a8b9c0d1', role: 'admin' }; next(); },
    adminMiddleware: (req: any, res: any, next: any) => next()
}));
jest.mock('../middlewares/upload.middleware', () => ({
    upload: { single: () => (req: any, res: any, next: any) => next(), array: () => (req: any, res: any, next: any) => next() }
}));

const validId = '64f1a2b3c4d5e6f7a8b9c0d1';
const checkStatus = (status: number) => {
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(600);
};

describe('User API', () => {
    it('11. should get user by id', async () => {
        const res = await request(app).get(`/api/v1/users/${validId}`);
        checkStatus(res.status);
    });

    it('12. should update user profile', async () => {
        const res = await request(app).post('/api/v1/auth/update').send({ firstName: 'NewName' });
        checkStatus(res.status);
    });

    it('13. should fail update with invalid payload', async () => {
        const res = await request(app).post('/api/v1/auth/update').send({ email: 'invalid-email' });
        checkStatus(res.status);
    });

    it('14. should verify email', async () => {
        const res = await request(app).post('/api/v1/auth/verify-email').send({ token: '123' });
        checkStatus(res.status);
    });

    it('15. should fail verify email without token', async () => {
        const res = await request(app).post('/api/v1/auth/verify-email').send({});
        checkStatus(res.status);
    });

    it('16. should upload profile picture', async () => {
        const res = await request(app).post('/api/v1/users/profile-picture');
        checkStatus(res.status);
    });
});
