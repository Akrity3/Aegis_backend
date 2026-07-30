import { IncidentService } from '../services/incident.service';
import { IncidentModel } from '../models/incident.model';

jest.mock('../models/incident.model', () => {
    const mockModelInstance = {
        save: jest.fn().mockResolvedValue(true),
        category: 'Theft',
    };
    const MockIncidentModel: any = jest.fn().mockImplementation(() => mockModelInstance);
    MockIncidentModel.create = jest.fn();
    MockIncidentModel.find = jest.fn();
    MockIncidentModel.findOne = jest.fn();
    MockIncidentModel.countDocuments = jest.fn();
    MockIncidentModel.deleteOne = jest.fn();
    MockIncidentModel.updateMany = jest.fn();
    MockIncidentModel.aggregate = jest.fn();
    return { IncidentModel: MockIncidentModel };
});

describe('IncidentService', () => {
    let service: IncidentService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new IncidentService();
    });

    describe('createIncident', () => {
        it('should save and return a new incident', async () => {
            const data = {
                category: 'Theft',
                description: 'Stolen laptop bag from car',
                latitude: 27.7172,
                longitude: 85.324,
                address: 'Kathmandu',
            };

            const result = await service.createIncident('64f1a2b3c4d5e6f7a8b9c0d1', data as any, 'http://example.com/photo.jpg');
            expect(result).toBeDefined();
        });
    });

    describe('getMyIncidents', () => {
        it('should return paginated incidents for user', async () => {
            (IncidentModel.countDocuments as jest.Mock).mockResolvedValue(10);
            (IncidentModel.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([{ _id: 'inc1' }]),
                    }),
                }),
            });

            const result = await service.getMyIncidents('64f1a2b3c4d5e6f7a8b9c0d1', 1, 10);
            expect(result.meta.total).toBe(10);
            expect(result.data).toHaveLength(1);
        });
    });

    describe('getPublicIncidents', () => {
        it('should return public incidents without userId', async () => {
            (IncidentModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([{ _id: 'public_inc1' }]),
                    }),
                }),
            });

            const result = await service.getPublicIncidents();
            expect(result).toHaveLength(1);
        });
    });

    describe('updateIncident', () => {
        it('should update and return incident if found', async () => {
            const mockIncident = {
                _id: 'inc1',
                category: 'Old',
                save: jest.fn().mockResolvedValue(true),
            };
            (IncidentModel.findOne as jest.Mock).mockResolvedValue(mockIncident);

            const result = await service.updateIncident('user1', 'inc1', { category: 'NewCategory' } as any);
            expect(mockIncident.save).toHaveBeenCalled();
            expect(result.category).toBe('NewCategory');
        });

        it('should throw 404 if incident to update is not found', async () => {
            (IncidentModel.findOne as jest.Mock).mockResolvedValue(null);

            await expect(service.updateIncident('user1', 'inc1', { category: 'New' } as any))
                .rejects.toMatchObject({ status: 404 });
        });
    });

    describe('deleteIncident', () => {
        it('should delete incident if found', async () => {
            const mockIncident = { _id: 'inc1' };
            (IncidentModel.findOne as jest.Mock).mockResolvedValue(mockIncident);
            (IncidentModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            const result = await service.deleteIncident('user1', 'inc1');
            expect(IncidentModel.deleteOne).toHaveBeenCalledWith({ _id: 'inc1' });
            expect(result).toBe(mockIncident);
        });

        it('should throw 404 if incident to delete is not found', async () => {
            (IncidentModel.findOne as jest.Mock).mockResolvedValue(null);

            await expect(service.deleteIncident('user1', 'inc1'))
                .rejects.toMatchObject({ status: 404 });
        });
    });
});
