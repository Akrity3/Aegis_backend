import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { SECRET_KEY, CORS_ORIGIN } from "../configs/constant";
import colors from "colors";

export interface AuthenticatedSocket extends Socket {
    userId?: string;
}

export class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;
    // Map userId to a Set of socketIds for multi-device support
    private userSocketsMap: Map<string, Set<string>> = new Map();

    private constructor() {}

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public initialize(server: HttpServer): Server {
        const allowedOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(",") : ["*"];
        
        this.io = new Server(server, {
            cors: {
                origin: allowedOrigins,
                credentials: true,
            },
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        // Authentication Middleware
        this.io.use((socket: AuthenticatedSocket, next) => {
            try {
                let token =
                    socket.handshake.auth?.token ||
                    socket.handshake.query?.token ||
                    socket.handshake.headers?.authorization;

                if (typeof token === "string" && token.startsWith("Bearer ")) {
                    token = token.slice(7);
                }

                // If cookie present
                if (!token && socket.handshake.headers.cookie) {
                    const cookies = socket.handshake.headers.cookie
                        .split(";")
                        .reduce((acc: any, cookie) => {
                            const [key, value] = cookie.trim().split("=");
                            acc[key] = value;
                            return acc;
                        }, {});
                    token = cookies["auth_token"];
                }

                if (!token) {
                    return next(new Error("Authentication error: Token missing"));
                }

                const decoded = jwt.verify(token as string, SECRET_KEY) as { id: string };
                socket.userId = decoded.id;
                next();
            } catch (err: any) {
                return next(new Error("Authentication error: Invalid or expired token"));
            }
        });

        this.io.on("connection", (socket: AuthenticatedSocket) => {
            const userId = socket.userId;
            if (!userId) return;

            console.log(colors.cyan(`[Socket.IO] User connected: ${userId} (Socket: ${socket.id})`));

            // Join personal room
            socket.join(`user:${userId}`);

            // Add socketId to user's set of active sockets
            if (!this.userSocketsMap.has(userId)) {
                this.userSocketsMap.set(userId, new Set());
            }
            this.userSocketsMap.get(userId)?.add(socket.id);

            // Socket disconnect handler
            socket.on("disconnect", (reason) => {
                console.log(colors.yellow(`[Socket.IO] User disconnected: ${userId} (${reason})`));
                const userSockets = this.userSocketsMap.get(userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        this.userSocketsMap.delete(userId);
                    }
                }
            });
        });

        console.log(colors.green.bold("[Socket.IO] Service initialized successfully"));
        return this.io;
    }

    public getIO(): Server {
        if (!this.io) {
            throw new Error("Socket.IO server has not been initialized!");
        }
        return this.io;
    }

    public emitToUser(userId: string, event: string, data: any): void {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
        }
    }

    public emitToUsers(userIds: string[], event: string, data: any): void {
        if (this.io) {
            userIds.forEach((userId) => {
                this.io?.to(`user:${userId}`).emit(event, data);
            });
        }
    }

    public broadcast(event: string, data: any): void {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    public isUserConnected(userId: string): boolean {
        const userSockets = this.userSocketsMap.get(userId);
        return userSockets !== undefined && userSockets.size > 0;
    }
}

export const socketService = SocketService.getInstance();
