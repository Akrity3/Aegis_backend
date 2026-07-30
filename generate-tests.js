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
jest.mock('../middlewares/authorized.middleware', () => {
    return {
        authorizedMiddleware: (req: any, res: any, next: any) => {
            req.user = { _id: 'user123', toObject: () => ({ _id: 'user123', email: 'test@test.com' }) };
            next();
        }
    };
});

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user', async () => {
        const mockUser = { toObject: () => ({ _id: '1', email: 'test@test.com' }) };
        UserService.prototype.createUser = jest.fn().mockResolvedValue(mockUser);

        const res = await request(app).post('/api/v1/users').send({
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            email: 'test@test.com',
            phoneNumber: '1234567890',
            password: 'password123'
        });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('should login a user', async () => {
        const mockUser = { toObject: () => ({ _id: '1', email: 'test@test.com' }) };
        UserService.prototype.loginUser = jest.fn().mockResolvedValue({ user: mockUser, token: 'token123' });

        const res = await request(app).post('/api/v1/users/login').send({
            email: 'test@test.com',
            password: 'password123'
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBe('token123');
    });

    it('should return 400 for invalid login', async () => {
        const res = await request(app).post('/api/v1/users/login').send({
            email: 'test@test.com'
        });

        expect(res.status).toBe(400);
    });

    it('should return current user profile on whoami', async () => {
        const res = await request(app).get('/api/v1/auth/whoami');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
    
    it('should send verification email', async () => {
        UserService.prototype.sendVerificationEmail = jest.fn().mockResolvedValue(true);
        const res = await request(app).post('/api/v1/auth/send-verification').send({ email: 'test@test.com' });
        expect(res.status).toBe(200);
    });
});
`;

const userTest = `
import request from 'supertest';
import app from '../app';
import { UserService } from '../services/user.service';

jest.mock('../services/user.service');
jest.mock('../middlewares/authorized.middleware', () => {
    return {
        authorizedMiddleware: (req: any, res: any, next: any) => {
            req.user = { _id: 'user123', toObject: () => ({ _id: 'user123', email: 'test@test.com' }) };
            next();
        }
    };
});

describe('User API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get user by id', async () => {
        const mockUser = { _id: 'user123', email: 'test@test.com' };
        UserService.prototype.getUserById = jest.fn().mockResolvedValue(mockUser);

        const res = await request(app).get('/api/v1/users/user123');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe('test@test.com');
    });
    
    it('should handle internal server errors gracefully', async () => {
        UserService.prototype.getUserById = jest.fn().mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/v1/users/user123');
        expect(res.status).toBe(500);
    });
});
`;

const incidentTest = `
import request from 'supertest';
import app from '../app';
import { IncidentService } from '../services/incident.service';

jest.mock('../services/incident.service');
jest.mock('../middlewares/authorized.middleware', () => {
    return {
        authorizedMiddleware: (req: any, res: any, next: any) => {
            req.user = { _id: 'user123', role: 'user' };
            next();
        }
    };
});
jest.mock('../middlewares/upload.middleware', () => {
    return {
        upload: { array: () => (req: any, res: any, next: any) => next() }
    };
});

describe('Incident API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create an incident', async () => {
        const mockIncident = { _id: 'inc1', title: 'Test Incident' };
        IncidentService.prototype.createIncident = jest.fn().mockResolvedValue(mockIncident);

        const res = await request(app).post('/api/v1/incidents').send({
            title: 'Test Incident',
            description: 'Test description',
            type: 'theft',
            latitude: 12.34,
            longitude: 56.78,
            severity: 'high'
        });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('should fetch all incidents', async () => {
        IncidentService.prototype.getAllIncidents = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/incidents');
        expect(res.status).toBe(200);
    });
    
    it('should fetch nearby incidents', async () => {
        IncidentService.prototype.getNearbyIncidents = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/incidents/nearby?latitude=12.34&longitude=56.78&radius=5');
        expect(res.status).toBe(200);
    });
});
`;

const adminTest = `
import request from 'supertest';
import app from '../app';
import { AdminService } from '../services/admin.service';

jest.mock('../services/admin.service');
jest.mock('../middlewares/authorized.middleware', () => {
    return {
        authorizedMiddleware: (req: any, res: any, next: any) => {
            req.user = { _id: 'admin1', role: 'admin' };
            next();
        },
        adminMiddleware: (req: any, res: any, next: any) => next()
    };
});

describe('Admin API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch admin dashboard stats', async () => {
        AdminService.prototype.getDashboardStats = jest.fn().mockResolvedValue({ totalUsers: 10 });
        const res = await request(app).get('/api/v1/admin/stats');
        expect(res.status).toBe(200);
        expect(res.body.data.totalUsers).toBe(10);
    });
});
`;

const notificationTest = `
import request from 'supertest';
import app from '../app';
import { NotificationService } from '../services/notification.service';

jest.mock('../services/notification.service');
jest.mock('../middlewares/authorized.middleware', () => {
    return {
        authorizedMiddleware: (req: any, res: any, next: any) => {
            req.user = { _id: 'user123' };
            next();
        }
    };
});

describe('Notification API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get user notifications', async () => {
        NotificationService.prototype.getUserNotifications = jest.fn().mockResolvedValue([]);
        const res = await request(app).get('/api/v1/notifications');
        expect(res.status).toBe(200);
    });
});
`;

fs.writeFileSync(path.join(testDir, 'auth.test.ts'), authTest);
fs.writeFileSync(path.join(testDir, 'user.test.ts'), userTest);
fs.writeFileSync(path.join(testDir, 'incident.test.ts'), incidentTest);
fs.writeFileSync(path.join(testDir, 'admin.test.ts'), adminTest);
fs.writeFileSync(path.join(testDir, 'notification.test.ts'), notificationTest);

console.log("Backend tests generated.");
