// Manual mock for mongoose - Jest picks this up automatically

const defaultDoc = { _id: '64f1a2b3c4d5e6f7a8b9c0d1', id: '64f1a2b3c4d5e6f7a8b9c0d1', title: 'Test', status: 'active', toObject: () => ({ _id: '64f1a2b3c4d5e6f7a8b9c0d1' }) };

const mockQuery: any = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(defaultDoc),
    findOne: jest.fn().mockResolvedValue(defaultDoc),
    findByIdAndUpdate: jest.fn().mockResolvedValue(defaultDoc),
    findByIdAndDelete: jest.fn().mockResolvedValue(defaultDoc),
    findOneAndUpdate: jest.fn().mockResolvedValue(defaultDoc),
    countDocuments: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue(defaultDoc),
    save: jest.fn().mockResolvedValue(defaultDoc),
    deleteMany: jest.fn().mockResolvedValue({}),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    regex: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    select: jest.fn().mockReturnThis(),
    then: function(resolve: any, reject: any) {
        return Promise.resolve([]).then(resolve, reject);
    }
};

function createSchemaMock() {
    const schema: any = {
        pre: jest.fn().mockReturnThis(),
        post: jest.fn().mockReturnThis(),
        virtual: jest.fn().mockReturnValue({ get: jest.fn(), set: jest.fn() }),
        index: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        plugin: jest.fn().mockReturnThis(),
        methods: {},
        statics: {},
        obj: {},
        add: jest.fn().mockReturnThis(),
        path: jest.fn().mockReturnThis(),
    };
    return schema;
}

const mongoose = {
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn().mockResolvedValue({}),
    connection: {
        collections: {},
        dropDatabase: jest.fn().mockResolvedValue({}),
        close: jest.fn().mockResolvedValue({}),
        on: jest.fn(),
        once: jest.fn(),
    },
    Schema: Object.assign(
        jest.fn().mockImplementation(() => createSchemaMock()),
        {
            Types: {
                ObjectId: 'ObjectId',
                String: String,
                Number: Number,
                Boolean: Boolean,
                Mixed: 'Mixed',
                Buffer: Buffer,
                Date: Date,
                Array: Array,
                Map: Map,
            },
        }
    ),
    model: jest.fn().mockReturnValue({
        ...mockQuery,
        prototype: {},
    }),
    Types: {
        ObjectId: jest.fn().mockImplementation((id?: string) => ({
            toString: () => id || '64f1a2b3c4d5e6f7a8b9c0d1',
            toHexString: () => id || '64f1a2b3c4d5e6f7a8b9c0d1',
        })),
        Array: [],
        Buffer: Buffer,
        String: String,
        Number: Number,
    },
    isValidObjectId: jest.fn().mockReturnValue(true),
    startSession: jest.fn().mockResolvedValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
    }),
};

module.exports = mongoose;
export default mongoose;
