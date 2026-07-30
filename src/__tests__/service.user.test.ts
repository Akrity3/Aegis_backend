import bcryptjs from 'bcryptjs';
import { HttpException } from '../exceptions/http-exception';

const mockRepoInstance = {
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
    getUserByEmailWithPassword: jest.fn(),
    getUserById: jest.fn(),
    getUserByToken: jest.fn(),
    getUserByVerificationToken: jest.fn(),
    updateProfilePicture: jest.fn(),
};

jest.mock('../repositories/user.repository', () => ({
    UserMongoRepository: jest.fn().mockImplementation(() => mockRepoInstance)
}));

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hashSync: jest.fn().mockReturnValue('hashed_dummy'),
    hash: jest.fn().mockResolvedValue('hashed'),
}));

// Import service AFTER mocks are declared
import { UserService } from '../services/user.service';

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new UserService();
    });

    describe('createUser', () => {
        it('should create a user successfully when email and username are unique', async () => {
            mockRepoInstance.getUserByEmail.mockResolvedValue(null);
            mockRepoInstance.getUserByUsername.mockResolvedValue(null);
            mockRepoInstance.createUser.mockResolvedValue({ _id: '64f1a2b3c4d5e6f7a8b9c0d1', email: 'test@test.com' });

            const result = await service.createUser({
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
                email: 'test@test.com',
                phoneNumber: '9800000000',
                password: 'pass123',
                profilePicture: 'default-profile.png',
                role: 'user',
                status: 'active'
            });
            expect(result).toBeDefined();
            expect(mockRepoInstance.createUser).toHaveBeenCalled();
        });

        it('should throw 400 when email already exists', async () => {
            mockRepoInstance.getUserByEmail.mockResolvedValue({ _id: 'existing' });

            await expect(service.createUser({
                firstName: 'John', lastName: 'Doe', username: 'johndoe',
                email: 'existing@test.com', phoneNumber: '9800000000', password: 'pass123',
                profilePicture: 'default-profile.png', role: 'user', status: 'active'
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should throw 400 when username already exists', async () => {
            mockRepoInstance.getUserByEmail.mockResolvedValue(null);
            mockRepoInstance.getUserByUsername.mockResolvedValue({ _id: 'existing' });

            await expect(service.createUser({
                firstName: 'John', lastName: 'Doe', username: 'taken',
                email: 'new@test.com', phoneNumber: '9800000000', password: 'pass123',
                profilePicture: 'default-profile.png', role: 'user', status: 'active'
            })).rejects.toMatchObject({ status: 400 });
        });
    });

    describe('loginUser', () => {
        it('should return user and token on valid credentials', async () => {
            const mockUser = {
                _id: '64f1a2b3c4d5e6f7a8b9c0d1',
                email: 'test@test.com',
                password: 'hashed_password',
                getSignedJwtToken: jest.fn().mockReturnValue('token123'),
            };
            mockRepoInstance.getUserByEmailWithPassword.mockResolvedValue(mockUser);
            (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.loginUser({ email: 'test@test.com', password: 'pass123' });
            expect(result.user).toBe(mockUser as any);
            expect(result.token).toBe('token123');
        });

        it('should throw 401 when user not found', async () => {
            mockRepoInstance.getUserByEmailWithPassword.mockResolvedValue(null);
            (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.loginUser({ email: 'x@x.com', password: 'wrong' }))
                .rejects.toMatchObject({ status: 401 });
        });
    });

    describe('getUserById', () => {
        it('should return the user when found', async () => {
            const mockUser = { _id: '64f1a2b3c4d5e6f7a8b9c0d1' };
            mockRepoInstance.getUserById.mockResolvedValue(mockUser);

            const result = await service.getUserById('64f1a2b3c4d5e6f7a8b9c0d1');
            expect(result).toBe(mockUser as any);
        });

        it('should throw 404 when user not found', async () => {
            mockRepoInstance.getUserById.mockResolvedValue(null);

            await expect(service.getUserById('nonexistent'))
                .rejects.toMatchObject({ status: 404 });
        });
    });

    describe('verifyEmail', () => {
        it('should verify email and return updated user', async () => {
            const mockUser = {
                _id: '1',
                isEmailVerified: false,
                verifiedAt: null,
                verificationToken: 'token',
                save: jest.fn().mockResolvedValue(true),
            };
            mockRepoInstance.getUserByVerificationToken.mockResolvedValue(mockUser);

            const result = await service.verifyEmail('validtoken');
            expect(result.isEmailVerified).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
        });
    });
});
