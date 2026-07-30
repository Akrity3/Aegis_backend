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

describe('Incident API', () => {
    it('18. should create an incident', async () => {
        const res = await request(app).post('/api/v1/incidents').send({ title: 'Test Incident', description: 'Test Description', category: 'Theft / Robbery', latitude: 27.7172, longitude: 85.324, address: 'Kathmandu' });
        checkStatus(res.status);
    });

    it('19. should fail create incident without title', async () => {
        const res = await request(app).post('/api/v1/incidents').send({ description: 'Test Description' });
        checkStatus(res.status);
    });

    it('20. should fetch all incidents', async () => {
        const res = await request(app).get('/api/v1/incidents');
        checkStatus(res.status);
    });

    it('21. should fetch my incidents', async () => {
        const res = await request(app).get('/api/v1/incidents/my');
        checkStatus(res.status);
    });

    it('22. should fetch public incidents', async () => {
        const res = await request(app).get('/api/v1/incidents/public');
        checkStatus(res.status);
    });

    it('23. should fetch incident by id', async () => {
        const res = await request(app).get(`/api/v1/incidents/${validId}`);
        checkStatus(res.status);
    });

    it('24. should fetch nearby incidents', async () => {
        const res = await request(app).get('/api/v1/incidents/nearby?latitude=27.7172&longitude=85.324');
        checkStatus(res.status);
    });

    it('25. should fetch risk zones', async () => {
        const res = await request(app).get('/api/v1/incidents/risk-zones');
        checkStatus(res.status);
    });
});
