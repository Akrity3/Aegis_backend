import bcryptjs from "bcryptjs";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import { UserMongoRepository } from "../repositories/user.repository";

const userRepository = new UserMongoRepository();

// ─────────────────────────────────────────────
// Pagination meta shape returned to the controller
// ─────────────────────────────────────────────
export interface PaginatedUsersResult {
    data: IUser[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class AdminService {
    // ── List users (paginated + searchable) ──────────────────────────
    async getUsers(
        page: number,
        limit: number,
        search?: string
    ): Promise<PaginatedUsersResult> {
        const { users, total } = await userRepository.getAllPaginated(
            page,
            limit,
            search
        );
        return {
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ── Get single user ──────────────────────────────────────────────
    async getUserById(id: string): Promise<IUser> {
        if (!id) {
            throw new HttpException(400, "Invalid user ID");
        }
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }

    // ── Create user ──────────────────────────────────────────────────
    async createUser(data: AdminCreateUserDTO): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(data.email);
        if (existingEmail) {
            throw new HttpException(400, "A user with this email already exists");
        }

        const existingUsername = await userRepository.getUserByUsername(
            data.username
        );
        if (existingUsername) {
            throw new HttpException(400, "A user with this username already exists");
        }

        return await userRepository.createUser(data);
    }

    // ── Update user ──────────────────────────────────────────────────
    async updateUser(id: string, data: AdminUpdateUserDTO): Promise<IUser> {
        if (!id || id.length !== 24) {
            throw new HttpException(400, "Invalid user ID");
        }

        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        // Email uniqueness check (only if email is being changed)
        if (data.email && data.email !== user.email) {
            const existing = await userRepository.getUserByEmail(data.email);
            if (existing) {
                throw new HttpException(
                    400,
                    "A user with this email already exists"
                );
            }
        }

        // Username uniqueness check (only if username is being changed)
        if (data.username && data.username !== user.username) {
            const existing = await userRepository.getUserByUsername(data.username);
            if (existing) {
                throw new HttpException(
                    400,
                    "A user with this username already exists"
                );
            }
        }

        // Hash password if explicitly being changed
        const updatePayload: Partial<IUser> = { ...data } as any;
        if (data.password) {
            const salt = await bcryptjs.genSalt(10);
            updatePayload.password = await bcryptjs.hash(data.password, salt);
        }

        const updated = await userRepository.update(id, updatePayload);
        if (!updated) {
            throw new HttpException(404, "User not found");
        }
        return updated;
    }

    // ── Delete user ──────────────────────────────────────────────────
    async deleteUser(id: string): Promise<void> {
        if (!id || id.length !== 24) {
            throw new HttpException(400, "Invalid user ID");
        }
        const deleted = await userRepository.delete(id);
        if (!deleted) {
            throw new HttpException(404, "User not found");
        }
    }

    // ── Get statistics ────────────────────────────────────────────────
    async getStats(): Promise<{
        totalUsers: number;
        totalAdmins: number;
        activeUsers: number;
        inactiveUsers: number;
    }> {
        const allUsers = await userRepository.getAll();
        
        const totalUsers = allUsers.length;
        const totalAdmins = allUsers.filter((u) => u.role === "admin").length;
        const activeUsers = allUsers.filter((u) => u.status === "active").length;
        const inactiveUsers = allUsers.filter((u) => u.status === "inactive").length;

        return {
            totalUsers,
            totalAdmins,
            activeUsers,
            inactiveUsers,
        };
    }
}
