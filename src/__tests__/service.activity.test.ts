import { ActivityService } from '../services/activity.service';
import { ActivityModel } from '../models/activity.model';

jest.mock('../models/activity.model', () => ({
    ActivityModel: {
        create: jest.fn(),
        countDocuments: jest.fn(),
        find: jest.fn(),
        deleteMany: jest.fn(),
    },
}));

describe('ActivityService', () => {
    let service: ActivityService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ActivityService();
    });

    it('should create an activity entry', async () => {
        const mockActivity = { _id: 'act1', type: 'LOGIN' };
        (ActivityModel.create as jest.Mock).mockResolvedValue(mockActivity);

        const res = await service.createActivity('u1', 'LOGIN' as any, 'Logged in');
        expect(res).toBe(mockActivity);
    });

    it('should fetch user activities paginated', async () => {
        (ActivityModel.countDocuments as jest.Mock).mockResolvedValue(2);
        (ActivityModel.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([{ _id: 'act1' }]),
                }),
            }),
        });

        const res = await service.getUserActivities('u1', 1, 10);
        expect(res.meta.total).toBe(2);
        expect(res.data).toHaveLength(1);
    });

    it('should get activities by type', async () => {
        (ActivityModel.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ _id: 'act1' }]),
            }),
        });

        const res = await service.getActivitiesByType('u1', 'LOGIN' as any, 10);
        expect(res).toHaveLength(1);
    });

    it('should delete old activities beyond cutoff date', async () => {
        (ActivityModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 15 });

        const count = await service.deleteOldActivities(90);
        expect(count).toBe(15);
        expect(ActivityModel.deleteMany).toHaveBeenCalled();
    });
});
