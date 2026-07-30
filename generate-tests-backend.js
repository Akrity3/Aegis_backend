const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'src', '__tests__');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

const authTest = `
import request from 'supertest';
import app from '../app';
import { UserService } from '../services/user.service';
import { AuthController } from '../controllers/auth.controller';

jest.mock('../services/user.service');
jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: 'user1' }; next(); }
}));

describe('Auth API', () => {
    beforeEach(() => jest.clearAllMocks());

    it('1. should register a new user successfully', async () => {
        (UserService.prototype as any).createUser = jest.fn().mockResolvedValue({ toObject: () => ({ _id: '1' }) });
        const res = await request(app).post('/api/v1/users').send({ firstName: 'J', lastName: 'D', username: 'j', email: 't@t.com', phoneNumber: '1', password: 'p' });
        expect(res.status).toBe(201);
    });

    it('2. should fail registration with invalid email', async () => {
        const res = await request(app).post('/api/v1/users').send({ email: 'invalid' });
        expect(res.status).toBe(400);
    });
    
    it('3. should fail registration with missing fields', async () => {
        const res = await request(app).post('/api/v1/users').send({});
        expect(res.status).toBe(400);
    });

    it('4. should login successfully', async () => {
        (UserService.prototype as any).loginUser = jest.fn().mockResolvedValue({ user: { toObject: () => ({}) }, token: 't' });
        const res = await request(app).post('/api/v1/users/login').send({ email: 't@t.com', password: 'p' });
        expect(res.status).toBe(200);
    });

    it('5. should fail login with missing password', async () => {
        const res = await request(app).post('/api/v1/users/login').send({ email: 't@t.com' });
        expect(res.status).toBe(400);
    });

    it('6. should return whoami profile', async () => {
        const res = await request(app).get('/api/v1/auth/whoami');
        expect(res.status).toBe(200);
    });

    it('7. should logout user', async () => {
        const res = await request(app).post('/api/v1/auth/logout');
        expect(res.status).toBe(200);
    });

    it('8. should refresh token', async () => {
        (UserService.prototype as any).refreshToken = jest.fn().mockResolvedValue({ user: { toObject: () => ({}) }, newToken: 't' });
        const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', ['token=token123']);
        expect(res.status).toBe(200);
    });
    
    it('9. should fail refresh without token', async () => {
        const res = await request(app).post('/api/v1/auth/refresh');
        expect(res.status).toBe(401);
    });

    it('10. should send verification email', async () => {
        (UserService.prototype as any).sendVerificationEmail = jest.fn().mockResolvedValue(true);
        const res = await request(app).post('/api/v1/auth/send-verification').send({ email: 't@t.com' });
        expect(res.status).toBe(200);
    });
});
`;

const userTest = `
import request from 'supertest';
import app from '../app';
import { UserService } from '../services/user.service';

jest.mock('../services/user.service');
jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: 'user1' }; next(); }
}));
jest.mock('../middlewares/upload.middleware', () => ({
    upload: { single: () => (req: any, res: any, next: any) => next(), array: () => (req: any, res: any, next: any) => next() }
}));

describe('User API', () => {
    beforeEach(() => jest.clearAllMocks());

    it('11. should get user by id', async () => {
        (UserService.prototype as any).getUserById = jest.fn().mockResolvedValue({ _id: 'user1' });
        const res = await request(app).get('/api/v1/users/user1');
        expect(res.status).toBe(200);
    });
    
    it('12. should fail get user on db error', async () => {
        (UserService.prototype as any).getUserById = jest.fn().mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/v1/users/user1');
        expect(res.status).toBe(500);
    });

    it('13. should update user profile', async () => {
        (UserService.prototype as any).updateUser = jest.fn().mockResolvedValue({ toObject: () => ({ _id: 'user1' }) });
        const res = await request(app).post('/api/v1/auth/update').send({ firstName: 'New' });
        expect(res.status).toBe(200);
    });
    
    it('14. should fail update with invalid data', async () => {
        const res = await request(app).post('/api/v1/auth/update').send({ email: 'invalid' });
        expect(res.status).toBe(400);
    });

    it('15. should verify email', async () => {
        (UserService.prototype as any).verifyEmail = jest.fn().mockResolvedValue({ toObject: () => ({}) });
        const res = await request(app).post('/api/v1/auth/verify-email').send({ token: '123' });
        expect(res.status).toBe(200);
    });
    
    it('16. should fail verify email without token', async () => {
        const res = await request(app).post('/api/v1/auth/verify-email').send({});
        expect(res.status).toBe(400);
    });
    
    it('17. should upload profile picture', async () => {
        (UserService.prototype as any).updateProfilePicture = jest.fn().mockResolvedValue({ toObject: () => ({}) });
        // Simulating upload middleware populated req.file
        const appWithMockFile = require('express')();
        appWithMockFile.use(require('express').json());
        appWithMockFile.post('/test', (req: any, res: any, next: any) => { req.file = { filename: 'test.jpg' }; req.user = { _id: '1' }; next(); }, new (require('../controllers/user.controller').UserController)().uploadProfilePicture);
        const res = await request(appWithMockFile).post('/test');
        expect(res.status).toBe(200);
    });
});
`;

const incidentTest = `
import request from 'supertest';
import app from '../app';
import { IncidentService } from '../services/incident.service';

jest.mock('../services/incident.service');
jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: 'user1' }; next(); }
}));
jest.mock('../middlewares/upload.middleware', () => ({
    upload: { single: () => (req: any, res: any, next: any) => next(), array: () => (req: any, res: any, next: any) => next() }
}));

describe('Incident API', () => {
    beforeEach(() => jest.clearAllMocks());

    it('18. should create an incident', async () => {
        (IncidentService.prototype as any).createIncident = jest.fn().mockResolvedValue({ _id: '1' });
        const res = await request(app).post('/api/v1/incidents').send({ title: 'T', description: 'D', type: 'theft', latitude: 1, longitude: 2, severity: 'high' });
        expect(res.status).toBe(201);
    });

    it('19. should fail create incident without title', async () => {
        const res = await request(app).post('/api/v1/incidents').send({ description: 'D', type: 'theft', latitude: 1, longitude: 2, severity: 'high' });
        expect(res.status).toBe(400);
    });

    it('20. should fetch all incidents', async () => {
        (IncidentService.prototype as any).getAllIncidents = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/incidents');
        expect(res.status).toBe(200);
    });
    
    it('21. should fetch nearby incidents', async () => {
        (IncidentService.prototype as any).getNearbyIncidents = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/incidents/nearby?latitude=1&longitude=2&radius=5');
        expect(res.status).toBe(200);
    });
    
    it('22. should fetch incident by id', async () => {
        (IncidentService.prototype as any).getIncidentById = jest.fn().mockResolvedValue({ _id: '1' });
        const res = await request(app).get('/api/v1/incidents/1');
        expect(res.status).toBe(200);
    });

    it('23. should update incident status', async () => {
        (IncidentService.prototype as any).updateIncidentStatus = jest.fn().mockResolvedValue({ _id: '1' });
        const res = await request(app).put('/api/v1/incidents/1/status').send({ status: 'resolved' });
        expect(res.status).toBe(200);
    });

    it('24. should upvote incident', async () => {
        (IncidentService.prototype as any).upvoteIncident = jest.fn().mockResolvedValue({ _id: '1' });
        const res = await request(app).post('/api/v1/incidents/1/upvote');
        expect(res.status).toBe(200);
    });

    it('25. should downvote incident', async () => {
        (IncidentService.prototype as any).downvoteIncident = jest.fn().mockResolvedValue({ _id: '1' });
        const res = await request(app).post('/api/v1/incidents/1/downvote');
        expect(res.status).toBe(200);
    });

    it('26. should add comment to incident', async () => {
        (IncidentService.prototype as any).addComment = jest.fn().mockResolvedValue({ _id: '1' });
        const res = await request(app).post('/api/v1/incidents/1/comments').send({ text: 'Hello' });
        expect(res.status).toBe(200);
    });

    it('27. should fetch user incidents', async () => {
        (IncidentService.prototype as any).getUserIncidents = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/incidents/user/my-incidents');
        expect(res.status).toBe(200);
    });
});
`;

const adminTest = `
import request from 'supertest';
import app from '../app';
import { AdminService } from '../services/admin.service';

jest.mock('../services/admin.service');
jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: 'admin1', role: 'admin' }; next(); },
    adminMiddleware: (req: any, res: any, next: any) => next()
}));

describe('Admin API', () => {
    beforeEach(() => jest.clearAllMocks());

    it('28. should fetch admin dashboard stats', async () => {
        (AdminService.prototype as any).getDashboardStats = jest.fn().mockResolvedValue({ totalUsers: 10 });
        const res = await request(app).get('/api/v1/admin/stats');
        expect(res.status).toBe(200);
    });

    it('29. should fetch all users for admin', async () => {
        (AdminService.prototype as any).getAllUsers = jest.fn().mockResolvedValue({ users: [], total: 0 });
        const res = await request(app).get('/api/v1/admin/users');
        expect(res.status).toBe(200);
    });
    
    it('30. should fetch all incidents for admin', async () => {
        (AdminService.prototype as any).getAllIncidents = jest.fn().mockResolvedValue({ incidents: [], total: 0 });
        const res = await request(app).get('/api/v1/admin/incidents');
        expect(res.status).toBe(200);
    });

    it('31. should delete a user', async () => {
        (AdminService.prototype as any).deleteUser = jest.fn().mockResolvedValue(true);
        const res = await request(app).delete('/api/v1/admin/users/1');
        expect(res.status).toBe(200);
    });

    it('32. should update user role', async () => {
        (AdminService.prototype as any).updateUserRole = jest.fn().mockResolvedValue(true);
        const res = await request(app).put('/api/v1/admin/users/1/role').send({ role: 'admin' });
        expect(res.status).toBe(200);
    });
    
    it('33. should fail update role with invalid role', async () => {
        const res = await request(app).put('/api/v1/admin/users/1/role').send({ role: 'invalid' });
        expect(res.status).toBe(400);
    });

    it('34. should get system settings', async () => {
        (AdminService.prototype as any).getSettings = jest.fn().mockResolvedValue({});
        const res = await request(app).get('/api/v1/admin/settings');
        expect(res.status).toBe(200);
    });

    it('35. should update system settings', async () => {
        (AdminService.prototype as any).updateSettings = jest.fn().mockResolvedValue({});
        const res = await request(app).put('/api/v1/admin/settings').send({ maintenanceMode: true });
        expect(res.status).toBe(200);
    });
});
`;

const notificationTest = `
import request from 'supertest';
import app from '../app';
import { NotificationService } from '../services/notification.service';

jest.mock('../services/notification.service');
jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: 'user1' }; next(); }
}));

describe('Notification API', () => {
    beforeEach(() => jest.clearAllMocks());

    it('36. should get user notifications', async () => {
        (NotificationService.prototype as any).getUserNotifications = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/notifications');
        expect(res.status).toBe(200);
    });

    it('37. should mark notification as read', async () => {
        (NotificationService.prototype as any).markAsRead = jest.fn().mockResolvedValue(true);
        const res = await request(app).put('/api/v1/notifications/1/read');
        expect(res.status).toBe(200);
    });

    it('38. should mark all notifications as read', async () => {
        (NotificationService.prototype as any).markAllAsRead = jest.fn().mockResolvedValue(true);
        const res = await request(app).put('/api/v1/notifications/read-all');
        expect(res.status).toBe(200);
    });
    
    it('39. should delete notification', async () => {
        (NotificationService.prototype as any).deleteNotification = jest.fn().mockResolvedValue(true);
        const res = await request(app).delete('/api/v1/notifications/1');
        expect(res.status).toBe(200);
    });
});
`;

const safetyCircleTest = `
import request from 'supertest';
import app from '../app';
import { SafetyCircleService } from '../services/safetyCircle.service';

jest.mock('../services/safetyCircle.service');
jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: 'user1' }; next(); }
}));

describe('Safety Circle API', () => {
    beforeEach(() => jest.clearAllMocks());

    it('40. should get safety circle', async () => {
        (SafetyCircleService.prototype as any).getSafetyCircle = jest.fn().mockResolvedValue({ members: [] });
        const res = await request(app).get('/api/v1/safety-circle');
        expect(res.status).toBe(200);
    });

    it('41. should add member to safety circle', async () => {
        (SafetyCircleService.prototype as any).addMember = jest.fn().mockResolvedValue({ members: [] });
        const res = await request(app).post('/api/v1/safety-circle').send({ email: 'friend@test.com' });
        expect(res.status).toBe(200);
    });
    
    it('42. should fail add member without email', async () => {
        const res = await request(app).post('/api/v1/safety-circle').send({});
        expect(res.status).toBe(400);
    });

    it('43. should remove member from safety circle', async () => {
        (SafetyCircleService.prototype as any).removeMember = jest.fn().mockResolvedValue({ members: [] });
        const res = await request(app).delete('/api/v1/safety-circle/1');
        expect(res.status).toBe(200);
    });

    it('44. should send SOS to safety circle', async () => {
        SafetyCircleService.prototype.sendSOS = jest.fn().mockResolvedValue(true);
        const res = await request(app).post('/api/v1/safety-circle/sos').send({ latitude: 1, longitude: 2 });
        expect(res.status).toBe(200);
    });

    it('45. should fail SOS without location', async () => {
        const res = await request(app).post('/api/v1/safety-circle/sos').send({});
        expect(res.status).toBe(400);
    });
});
`;

const alertTest = `
import request from 'supertest';
import app from '../app';
import { AlertService } from '../services/alert.service';

jest.mock('../services/alert.service');
jest.mock('../middlewares/authorized.middleware', () => ({
    authorizedMiddleware: (req: any, res: any, next: any) => { req.user = { _id: 'user1' }; next(); }
}));

describe('Alert API', () => {
    beforeEach(() => jest.clearAllMocks());

    it('46. should get active alerts', async () => {
        (AlertService.prototype as any).getActiveAlerts = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/alerts');
        expect(res.status).toBe(200);
    });

    it('47. should create an alert', async () => {
        (AlertService.prototype as any).createAlert = jest.fn().mockResolvedValue({ _id: '1' });
        const res = await request(app).post('/api/v1/alerts').send({ type: 'weather', severity: 'high', message: 'Test' });
        expect(res.status).toBe(201);
    });

    it('48. should resolve an alert', async () => {
        (AlertService.prototype as any).resolveAlert = jest.fn().mockResolvedValue(true);
        const res = await request(app).put('/api/v1/alerts/1/resolve');
        expect(res.status).toBe(200);
    });
    
    it('49. should delete an alert', async () => {
        (AlertService.prototype as any).deleteAlert = jest.fn().mockResolvedValue(true);
        const res = await request(app).delete('/api/v1/alerts/1');
        expect(res.status).toBe(200);
    });
    
    it('50. should fail create alert without data', async () => {
        const res = await request(app).post('/api/v1/alerts').send({});
        expect(res.status).toBe(400);
    });
});
`;

fs.writeFileSync(path.join(testDir, 'auth.test.ts'), authTest);
fs.writeFileSync(path.join(testDir, 'user.test.ts'), userTest);
fs.writeFileSync(path.join(testDir, 'incident.test.ts'), incidentTest);
fs.writeFileSync(path.join(testDir, 'admin.test.ts'), adminTest);
fs.writeFileSync(path.join(testDir, 'notification.test.ts'), notificationTest);
fs.writeFileSync(path.join(testDir, 'safetyCircle.test.ts'), safetyCircleTest);
fs.writeFileSync(path.join(testDir, 'alert.test.ts'), alertTest);

console.log("50 Backend tests generated.");
