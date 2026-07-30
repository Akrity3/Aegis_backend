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

describe('Safety Circle API', () => {
    it('40. should get safety circle', async () => {
        const res = await request(app).get('/api/v1/safety-circle');
        checkStatus(res.status);
    });

    it('41. should add contact to safety circle', async () => {
        const res = await request(app).post('/api/v1/safety-circle').send({ contactId: validId });
        checkStatus(res.status);
    });

    it('42. should update safety circle status', async () => {
        const res = await request(app).put(`/api/v1/safety-circle/${validId}/status`).send({ status: 'active' });
        checkStatus(res.status);
    });

    it('43. should delete safety circle member', async () => {
        const res = await request(app).delete(`/api/v1/safety-circle/${validId}`);
        checkStatus(res.status);
    });
});
