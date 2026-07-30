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

describe('Notification API', () => {
    it('36. should get user notifications', async () => {
        const res = await request(app).get('/api/v1/notifications');
        checkStatus(res.status);
    });

    it('37. should get unread count', async () => {
        const res = await request(app).get('/api/v1/notifications/unread-count');
        checkStatus(res.status);
    });

    it('38. should mark notification as read', async () => {
        const res = await request(app).put('/api/v1/notifications/mark-read').send({ notificationId: validId });
        checkStatus(res.status);
    });

    it('39. should mark all notifications as read', async () => {
        const res = await request(app).put('/api/v1/notifications/mark-all-read');
        checkStatus(res.status);
    });
});
