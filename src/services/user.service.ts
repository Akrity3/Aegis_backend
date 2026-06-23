import bcryptjs from "bcryptjs";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import { UserMongoRepository } from "../repositories/user.repository";

const userRepository = new UserMongoRepository();
const TIMING_DUMMY_HASH = bcryptjs.hashSync("equalize-login-timing", 10);

export class UserService {
    async createUser(userData: CreateUserDTO): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(
            userData.email
        );
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }

        const existingUsername = await userRepository.getUserByUsername(
            userData.username
        );
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }

        return await userRepository.createUser(userData);
    }

    async loginUser(
        loginData: LoginUserDTO
    ): Promise<{ user: IUser; token: string }> {
        const user = await userRepository.getUserByEmailWithPassword(
            loginData.email
        );

        const candidateHash = user?.password ?? TIMING_DUMMY_HASH;
        const matches = await bcryptjs.compare(
            loginData.password,
            candidateHash
        );

        if (!user || !matches) {
            throw new HttpException(401, "Invalid credentials");
        }

        const token = user.getSignedJwtToken();
        return { user, token };
    }

    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }

    async updateProfilePicture(id: string, filename: string): Promise<IUser> {
        const user = await userRepository.updateProfilePicture(id, filename);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }
}
