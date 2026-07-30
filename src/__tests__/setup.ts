import mongoose from 'mongoose';

// Simple in-memory mocks for global test setup
// Tests mock services directly so no real DB connection is needed

export const setupDatabase = async () => {
    // No-op: services are mocked in individual test files
};

export const clearDatabase = async () => {
    // No-op
};

export const closeDatabase = async () => {
    // No-op
};

jest.mock('../utils/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('firebase-admin', () => ({
    messaging: jest.fn().mockReturnValue({
        send: jest.fn().mockResolvedValue('projects/test/messages/1234'),
        sendMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
    }),
    credential: {
        cert: jest.fn(),
    },
    initializeApp: jest.fn(),
}));
