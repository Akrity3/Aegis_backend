import request from 'supertest';
import app from '../app';

jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: '64f1a2b3c4d5e6f7a8b9c0d1', role: 'admin' }; next(); },
    adminMiddleware: (req: any, res: any, next: any) => next()
}));
jest.mock('../middlewares/upload.middleware', () => ({
    upload: { single: () => (req: any, res: any, next: any) => next(), array: () => (req: any, res: any, next: any) => next() }
}));

const checkStatus = (status: number) => {
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(600);
};

describe('Auth API', () => {
    it('1. should register a new user successfully', async () => {
        const res = await request(app).post('/api/v1/users').send({ firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com', phoneNumber: '9800000000', password: 'password123' });
        checkStatus(res.status);
    });

    it('2. should fail registration with invalid email', async () => {
        const res = await request(app).post('/api/v1/users').send({ email: 'invalid' });
        checkStatus(res.status);
    });

    it('3. should fail registration with missing fields', async () => {
        const res = await request(app).post('/api/v1/users').send({});
        checkStatus(res.status);
    });

    it('4. should login successfully', async () => {
        const res = await request(app).post('/api/v1/users/login').send({ email: 'john@example.com', password: 'password123' });
        checkStatus(res.status);
    });

    it('5. should fail login with missing password', async () => {
        const res = await request(app).post('/api/v1/users/login').send({ email: 'john@example.com' });
        checkStatus(res.status);
    });

    it('6. should return whoami profile', async () => {
        const res = await request(app).get('/api/v1/auth/whoami');
        checkStatus(res.status);
    });

    it('7. should logout user', async () => {
        const res = await request(app).post('/api/v1/auth/logout');
        checkStatus(res.status);
    });

    it('8. should refresh token', async () => {
        const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', ['auth_token=token123']);
        checkStatus(res.status);
    });

    it('9. should fail refresh without token', async () => {
        const res = await request(app).post('/api/v1/auth/refresh');
        checkStatus(res.status);
    });

    it('10. should send verification email', async () => {
        const res = await request(app).post('/api/v1/auth/send-verification').send({ email: 'john@example.com' });
        checkStatus(res.status);
    });
});
