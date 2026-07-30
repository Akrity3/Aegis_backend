import { NotificationService } from '../services/notification.service';
import { NotificationModel } from '../models/notification.model';

jest.mock('../models/notification.model', () => ({
    NotificationModel: {
        create: jest.fn(),
        countDocuments: jest.fn(),
        find: jest.fn(),
        updateMany: jest.fn(),
        deleteOne: jest.fn(),
    },
}));

describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new NotificationService();
    });

    it('should create notification', async () => {
        const mockNotification = { _id: 'n1', title: 'Test' };
        (NotificationModel.create as jest.Mock).mockResolvedValue(mockNotification);

        const result = await service.createNotification('u1', 'alert' as any, 'Test', 'Message');
        expect(result).toBe(mockNotification);
    });

    it('should get user notifications with pagination', async () => {
        (NotificationModel.countDocuments as jest.Mock).mockResolvedValue(5);
        (NotificationModel.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([{ _id: 'n1' }]),
                }),
            }),
        });

        const result = await service.getUserNotifications('u1', 1, 10);
        expect(result.meta.total).toBe(5);
        expect(result.data).toHaveLength(1);
    });

    it('should return unread count', async () => {
        (NotificationModel.countDocuments as jest.Mock).mockResolvedValue(3);
        const count = await service.getUnreadCount('u1');
        expect(count).toBe(3);
    });

    it('should mark specified notifications as read', async () => {
        (NotificationModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
        await service.markAsRead('u1', ['n1', 'n2']);
        expect(NotificationModel.updateMany).toHaveBeenCalled();
    });

    it('should mark all notifications as read', async () => {
        (NotificationModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 5 });
        await service.markAllAsRead('u1');
        expect(NotificationModel.updateMany).toHaveBeenCalledWith({ userId: 'u1', read: false }, { read: true });
    });

    it('should delete notification', async () => {
        (NotificationModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
        await service.deleteNotification('u1', 'n1');
        expect(NotificationModel.deleteOne).toHaveBeenCalledWith({ _id: 'n1', userId: 'u1' });
    });
});
