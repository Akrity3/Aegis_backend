import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
    getUserById(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByEmailWithPassword(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getUserByToken(token: string): Promise<IUser | null>;
    getUserByVerificationToken(token: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    updateProfilePicture(id: string, filename: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
    getAllPaginated(page: number, limit: number, search?: string): Promise<{ users: IUser[]; total: number }>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
}

export class UserMongoRepository implements IUserRepository {
    async getUserById(id: string): Promise<IUser | null> {
        return UserModel.findById(id);
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }

    async getUserByEmailWithPassword(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email }).select("+password");
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        return UserModel.findOne({ username }).collation({
            locale: "en",
            strength: 2,
        });
    }

    async getUserByToken(token: string): Promise<IUser | null> {
        try {
            const decoded = require('jsonwebtoken').verify(token, process.env.SECRET_KEY || 'your-secret-key');
            return UserModel.findById(decoded.id);
        } catch (error) {
            return null;
        }
    }

    async getUserByVerificationToken(token: string): Promise<IUser | null> {
        return UserModel.findOne({ verificationToken: token });
    }

    async createUser(user: Partial<IUser>): Promise<IUser> {
        return UserModel.create(user);
    }

    async updateProfilePicture(
        id: string,
        filename: string
    ): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(
            id,
            { profilePicture: filename },
            { new: true, runValidators: true }
        );
    }

    async getAll(): Promise<IUser[]> {
        return UserModel.find();
    }

    async getAllPaginated(page: number, limit: number, search?: string): Promise<{ users: IUser[]; total: number }> {
        const skip = (page - 1) * limit;
        
        let query = UserModel.find();
        
        if (search) {
            query = query.or([
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ]);
        }
        
        const users = await query.skip(skip).limit(limit).select('-password');
        const total = await UserModel.countDocuments(search ? {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ]
        } : {});
        
        return { users, total };
    }

    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
