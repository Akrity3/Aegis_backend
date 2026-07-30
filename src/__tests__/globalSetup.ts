// Global Jest setup file to mock repositories and external services before modules load

const defaultPaginated = { data: [], users: [], incidents: [], alerts: [], activities: [], notifications: [], safetyCircles: [], total: 0, meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
const defaultDoc = { _id: '64f1a2b3c4d5e6f7a8b9c0d1', id: '64f1a2b3c4d5e6f7a8b9c0d1', title: 'Test', status: 'active', toObject: () => ({ _id: '64f1a2b3c4d5e6f7a8b9c0d1' }) };

jest.mock('../repositories/user.repository', () => ({
    UserMongoRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockResolvedValue([]),
        getAllPaginated: jest.fn().mockResolvedValue(defaultPaginated),
        getById: jest.fn().mockResolvedValue(defaultDoc),
        getUserById: jest.fn().mockResolvedValue(defaultDoc),
        create: jest.fn().mockResolvedValue(defaultDoc),
        createUser: jest.fn().mockResolvedValue(defaultDoc),
        update: jest.fn().mockResolvedValue(defaultDoc),
        delete: jest.fn().mockResolvedValue(true),
        findByEmail: jest.fn().mockResolvedValue(null),
        getUserByEmail: jest.fn().mockResolvedValue(null),
        findByUsername: jest.fn().mockResolvedValue(null),
        getUserByUsername: jest.fn().mockResolvedValue(null),
        getUserByEmailWithPassword: jest.fn().mockResolvedValue(null),
        getUserByToken: jest.fn().mockResolvedValue(null),
        getUserByVerificationToken: jest.fn().mockResolvedValue(null),
        updateProfilePicture: jest.fn().mockResolvedValue(defaultDoc),
        getStats: jest.fn().mockResolvedValue({ total: 0, active: 0, inactive: 0, verified: 0, unverified: 0 }),
    }))
}));

jest.mock('../repositories/incident.repository', () => ({
    IncidentMongoRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockResolvedValue([]),
        getAllPaginated: jest.fn().mockResolvedValue(defaultPaginated),
        getById: jest.fn().mockResolvedValue(defaultDoc),
        create: jest.fn().mockResolvedValue(defaultDoc),
        update: jest.fn().mockResolvedValue(defaultDoc),
        delete: jest.fn().mockResolvedValue(true),
        getByStatus: jest.fn().mockResolvedValue([]),
        getByCategory: jest.fn().mockResolvedValue([]),
        getByDateRange: jest.fn().mockResolvedValue([]),
        getStats: jest.fn().mockResolvedValue({ total: 0, pending: 0, verified: 0, rejected: 0 }),
    }))
}));

jest.mock('../repositories/alert.repository', () => ({
    AlertMongoRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockResolvedValue([]),
        getAllPaginated: jest.fn().mockResolvedValue(defaultPaginated),
        getById: jest.fn().mockResolvedValue(defaultDoc),
        create: jest.fn().mockResolvedValue(defaultDoc),
        update: jest.fn().mockResolvedValue(defaultDoc),
        delete: jest.fn().mockResolvedValue(true),
        getActiveAlerts: jest.fn().mockResolvedValue([]),
        getByUserId: jest.fn().mockResolvedValue([]),
        getStats: jest.fn().mockResolvedValue({ total: 0, active: 0, resolved: 0 }),
    }))
}));

jest.mock('../repositories/activity.repository', () => ({
    ActivityMongoRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockResolvedValue([]),
        getAllPaginated: jest.fn().mockResolvedValue(defaultPaginated),
        getById: jest.fn().mockResolvedValue(defaultDoc),
        create: jest.fn().mockResolvedValue(defaultDoc),
        getByUserId: jest.fn().mockResolvedValue([]),
        getByType: jest.fn().mockResolvedValue([]),
        getStats: jest.fn().mockResolvedValue({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 }),
    }))
}));

jest.mock('../repositories/notification.repository', () => ({
    NotificationMongoRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockResolvedValue([]),
        getAllPaginated: jest.fn().mockResolvedValue(defaultPaginated),
        getById: jest.fn().mockResolvedValue(defaultDoc),
        create: jest.fn().mockResolvedValue(defaultDoc),
        getByUserId: jest.fn().mockResolvedValue([]),
        markAsRead: jest.fn().mockResolvedValue(true),
        markAllAsRead: jest.fn().mockResolvedValue(true),
        delete: jest.fn().mockResolvedValue(true),
        getUnreadCount: jest.fn().mockResolvedValue(0),
    }))
}));

jest.mock('../repositories/safetyCircle.repository', () => ({
    SafetyCircleMongoRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockResolvedValue([]),
        getAllPaginated: jest.fn().mockResolvedValue(defaultPaginated),
        getById: jest.fn().mockResolvedValue(defaultDoc),
        getByUserId: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue(defaultDoc),
        update: jest.fn().mockResolvedValue(defaultDoc),
        delete: jest.fn().mockResolvedValue(true),
        getByContactId: jest.fn().mockResolvedValue([]),
        getStats: jest.fn().mockResolvedValue({ total: 0, active: 0, inactive: 0, pending: 0 }),
    }))
}));

jest.mock('../repositories/settings.repository', () => ({
    SettingsMongoRepository: jest.fn().mockImplementation(() => ({
        getSettings: jest.fn().mockResolvedValue({}),
        updateSettings: jest.fn().mockResolvedValue({}),
    }))
}));

jest.mock('../repositories/auditLog.repository', () => ({
    AuditLogMongoRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockResolvedValue([]),
        getAllPaginated: jest.fn().mockResolvedValue(defaultPaginated),
        getById: jest.fn().mockResolvedValue(defaultDoc),
        create: jest.fn().mockResolvedValue(defaultDoc),
        getStats: jest.fn().mockResolvedValue({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 }),
    }))
}));

// Mock firebase-admin globally
jest.mock('firebase-admin', () => ({
    messaging: jest.fn().mockReturnValue({
        send: jest.fn().mockResolvedValue('projects/test/messages/1234'),
        sendMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
    }),
    credential: { cert: jest.fn() },
    initializeApp: jest.fn(),
    apps: [],
    app: jest.fn(),
}));

// Mock email utils
jest.mock('../utils/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}), { virtual: true });
