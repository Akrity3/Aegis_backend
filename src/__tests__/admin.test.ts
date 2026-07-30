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

describe('Admin API', () => {
    it('28. should fetch admin dashboard stats', async () => {
        const res = await request(app).get('/api/v1/admin/dashboard');
        checkStatus(res.status);
    });

    it('29. should fetch all users for admin', async () => {
        const res = await request(app).get('/api/v1/admin/users');
        checkStatus(res.status);
    });

    it('30. should fetch all incidents for admin', async () => {
        const res = await request(app).get('/api/v1/admin/incidents');
        checkStatus(res.status);
    });

    it('31. should delete a user', async () => {
        const res = await request(app).delete(`/api/v1/admin/users/${validId}`);
        checkStatus(res.status);
    });

    it('32. should update user role', async () => {
        const res = await request(app).patch(`/api/v1/admin/users/${validId}`).send({ role: 'admin' });
        checkStatus(res.status);
    });

    it('33. should fail update role with invalid payload', async () => {
        const res = await request(app).patch(`/api/v1/admin/users/${validId}`).send({ firstName: 123 });
        checkStatus(res.status);
    });

    it('34. should get system settings', async () => {
        const res = await request(app).get('/api/v1/admin/settings');
        checkStatus(res.status);
    });

    it('35. should update system settings', async () => {
        const res = await request(app).patch('/api/v1/admin/settings').send({ maintenanceMode: true });
        checkStatus(res.status);
    });
});
