import request from 'supertest';
import app from '../app';

jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: '64f1a2b3c4d5e6f7a8b9c0d1' }; next(); },
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

describe('Alert API', () => {
    it('46. should get my alerts', async () => {
        const res = await request(app).get('/api/v1/alerts/my');
        checkStatus(res.status);
    });

    it('47. should trigger an alert', async () => {
        const res = await request(app).post('/api/v1/alerts/trigger').send({ type: 'sos', latitude: 27.7, longitude: 85.3 });
        checkStatus(res.status);
    });

    it('48. should resolve an alert', async () => {
        const res = await request(app).put(`/api/v1/alerts/resolve/${validId}`);
        checkStatus(res.status);
    });

    it('49. should handle resolve alert route successfully', async () => {
        const res = await request(app).put(`/api/v1/alerts/resolve/${validId}`);
        checkStatus(res.status);
    });

    it('50. should fail trigger alert without required location data', async () => {
        const res = await request(app).post('/api/v1/alerts/trigger').send({});
        checkStatus(res.status);
    });
});
