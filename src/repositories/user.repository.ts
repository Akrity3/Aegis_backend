import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
    getUserById(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByEmailWithPassword(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    updateProfilePicture(id: string, filename: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
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

    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
