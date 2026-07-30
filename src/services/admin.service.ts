import bcryptjs from "bcryptjs";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import { UserMongoRepository } from "../repositories/user.repository";
import { IncidentMongoRepository } from "../repositories/incident.repository";
import { AlertMongoRepository } from "../repositories/alert.repository";
import { ActivityMongoRepository } from "../repositories/activity.repository";
import { NotificationMongoRepository } from "../repositories/notification.repository";
import { SafetyCircleMongoRepository } from "../repositories/safetyCircle.repository";
import { IIncident } from "../models/incident.model";
import { IAlert } from "../models/alert.model";
import { IActivity } from "../models/activity.model";

const userRepository = new UserMongoRepository();
const incidentRepository = new IncidentMongoRepository();
const alertRepository = new AlertMongoRepository();
const activityRepository = new ActivityMongoRepository();
const notificationRepository = new NotificationMongoRepository();
const safetyCircleRepository = new SafetyCircleMongoRepository();

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

export interface PaginatedIncidentsResult {
    data: IIncident[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PaginatedAlertsResult {
    data: IAlert[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PaginatedActivitiesResult {
    data: IActivity[];
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

    // ── Dashboard Stats ──────────────────────────────────────────────
    async getDashboardStats(): Promise<{
        totalUsers: number;
        verifiedUsers: number;
        activeUsers: number;
        blockedUsers: number;
        totalIncidents: number;
        pendingIncidents: number;
        verifiedIncidents: number;
        rejectedIncidents: number;
        activeSOSAlerts: number;
        resolvedSOSAlerts: number;
        unreadNotifications: number;
        safetyCircleMembers: number;
        activitiesToday: number;
        reportsToday: number;
        reportsThisWeek: number;
        reportsThisMonth: number;
        recentActivities: IActivity[];
        recentAlerts: IAlert[];
        recentIncidents: IIncident[];
        riskZoneSummary: any[];
    }> {
        const allUsers = await userRepository.getAll();
        const incidentStats = await incidentRepository.getStats();
        const alertStats = await alertRepository.getStats();
        const activityStats = await activityRepository.getStats();
        const safetyCircleStats = await safetyCircleRepository.getStats();
        
        const activeUsers = allUsers.filter((u) => u.status === "active").length;
        const blockedUsers = allUsers.filter((u) => u.status === "inactive").length;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count unread notifications across all users
        const allNotifications = await notificationRepository.getAll();
        const unreadNotifications = allNotifications.filter(n => !n.read).length;

        const recentActivities = await activityRepository.getByDateRange(todayStart, new Date());
        const recentAlerts = await alertRepository.getAll();
        const recentIncidents = await incidentRepository.getAll();

        // Risk zone summary - aggregate incidents by location clusters
        const incidents = await incidentRepository.getAll();
        const riskZoneSummary = this.calculateRiskZones(incidents);

        // Reports by date
        const reportsToday = incidents.filter(i => new Date(i.reportedAt) >= todayStart).length;
        const reportsThisWeek = incidents.filter(i => new Date(i.reportedAt) >= weekStart).length;
        const reportsThisMonth = incidents.filter(i => new Date(i.reportedAt) >= monthStart).length;

        return {
            totalUsers: allUsers.length,
            verifiedUsers: allUsers.length, // Using total users as verified count since field was removed
            activeUsers,
            blockedUsers,
            totalIncidents: incidentStats.total,
            pendingIncidents: incidentStats.pending,
            verifiedIncidents: incidentStats.verified,
            rejectedIncidents: incidentStats.rejected,
            activeSOSAlerts: alertStats.active,
            resolvedSOSAlerts: alertStats.resolved,
            unreadNotifications,
            safetyCircleMembers: safetyCircleStats.total,
            activitiesToday: activityStats.today,
            reportsToday,
            reportsThisWeek,
            reportsThisMonth,
            recentActivities: recentActivities.slice(0, 10),
            recentAlerts: recentAlerts.slice(0, 10),
            recentIncidents: recentIncidents.slice(0, 10),
            riskZoneSummary,
        };
    }

    // Helper to calculate risk zones from incident locations
    private calculateRiskZones(incidents: IIncident[]): any[] {
        const zones: Map<string, { count: number; lat: number; lng: number }> = new Map();
        
        incidents.forEach(incident => {
            // Group by approximate location (0.01 degree ~ 1km)
            const latKey = Math.round(incident.latitude * 100) / 100;
            const lngKey = Math.round(incident.longitude * 100) / 100;
            const key = `${latKey},${lngKey}`;
            
            if (zones.has(key)) {
                zones.get(key)!.count++;
            } else {
                zones.set(key, { count: 1, lat: latKey, lng: lngKey });
            }
        });

        // Return top 10 risk zones
        return Array.from(zones.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map(zone => ({
                latitude: zone.lat,
                longitude: zone.lng,
                incidentCount: zone.count,
                riskLevel: zone.count > 5 ? 'high' : zone.count > 2 ? 'medium' : 'low'
            }));
    }

    // ── Incident Management ───────────────────────────────────────────
    async getIncidents(page: number, limit: number, filters?: any): Promise<PaginatedIncidentsResult> {
        const { incidents, total } = await incidentRepository.getAllPaginated(page, limit, filters);
        return {
            data: incidents,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getIncidentById(id: string): Promise<IIncident> {
        if (!id) {
            throw new HttpException(400, "Invalid incident ID");
        }
        const incident = await incidentRepository.getById(id);
        if (!incident) {
            throw new HttpException(404, "Incident not found");
        }
        return incident;
    }

    async updateIncident(id: string, data: any): Promise<IIncident> {
        if (!id || id.length !== 24) {
            throw new HttpException(400, "Invalid incident ID");
        }
        const updated = await incidentRepository.update(id, data);
        if (!updated) {
            throw new HttpException(404, "Incident not found");
        }
        return updated;
    }

    async deleteIncident(id: string): Promise<void> {
        if (!id || id.length !== 24) {
            throw new HttpException(400, "Invalid incident ID");
        }
        const deleted = await incidentRepository.delete(id);
        if (!deleted) {
            throw new HttpException(404, "Incident not found");
        }
    }

    // ── Alert Management ──────────────────────────────────────────────
    async getAlerts(page: number, limit: number, filters?: any): Promise<PaginatedAlertsResult> {
        const { alerts, total } = await alertRepository.getAllPaginated(page, limit, filters);
        return {
            data: alerts,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAlertById(id: string): Promise<IAlert> {
        if (!id) {
            throw new HttpException(400, "Invalid alert ID");
        }
        const alert = await alertRepository.getById(id);
        if (!alert) {
            throw new HttpException(404, "Alert not found");
        }
        return alert;
    }

    async resolveAlert(id: string): Promise<IAlert> {
        if (!id || id.length !== 24) {
            throw new HttpException(400, "Invalid alert ID");
        }
        const updated = await alertRepository.update(id, { status: 'resolved', resolvedAt: new Date() });
        if (!updated) {
            throw new HttpException(404, "Alert not found");
        }
        return updated;
    }

    // ── Activity Management ───────────────────────────────────────────
    async getActivities(page: number, limit: number, filters?: any): Promise<PaginatedActivitiesResult> {
        const { activities, total } = await activityRepository.getAllPaginated(page, limit, filters);
        return {
            data: activities,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ── Analytics ─────────────────────────────────────────────────────
    async getAnalytics(): Promise<{
        incidentTrends: any[];
        sosTrends: any[];
        userGrowth: any[];
        incidentCategories: any[];
        reportsPerDay: any[];
        reportsPerMonth: any[];
        activeUsers: number;
        safetyCircleGrowth: any[];
    }> {
        const incidents = await incidentRepository.getAll();
        const alerts = await alertRepository.getAll();
        const users = await userRepository.getAll();
        const safetyCircles = await safetyCircleRepository.getAll();

        // Incident trends - last 7 days
        const incidentTrends = this.getTrendsByDate(incidents, 'reportedAt', 7);

        // SOS trends - last 7 days
        const sosTrends = this.getTrendsByDate(alerts, 'triggeredAt', 7);

        // User growth - last 30 days
        const userGrowth = this.getTrendsByDate(users, 'createdAt', 30);

        // Incident categories distribution
        const incidentCategories = this.getCategoryDistribution(incidents);

        // Reports per day - last 30 days
        const reportsPerDay = this.getTrendsByDate(incidents, 'reportedAt', 30);

        // Reports per month - last 12 months
        const reportsPerMonth = this.getMonthlyTrends(incidents, 'reportedAt', 12);

        // Safety circle growth - last 30 days
        const safetyCircleGrowth = this.getTrendsByDate(safetyCircles, 'createdAt', 30);

        const activeUsers = users.filter(u => u.status === 'active').length;

        return {
            incidentTrends,
            sosTrends,
            userGrowth,
            incidentCategories,
            reportsPerDay,
            reportsPerMonth,
            activeUsers,
            safetyCircleGrowth,
        };
    }

    // Helper to get daily trends
    private getTrendsByDate(items: any[], dateField: string, days: number): any[] {
        const trends: any[] = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const count = items.filter(item => {
                const itemDate = new Date(item[dateField]).toISOString().split('T')[0];
                return itemDate === dateStr;
            }).length;
            
            trends.push({
                date: dateStr,
                count,
            });
        }
        
        return trends;
    }

    // Helper to get monthly trends
    private getMonthlyTrends(items: any[], dateField: string, months: number): any[] {
        const trends: any[] = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
            
            const count = items.filter(item => {
                const itemDate = new Date(item[dateField]).toISOString().slice(0, 7);
                return itemDate === monthStr;
            }).length;
            
            trends.push({
                month: monthStr,
                count,
            });
        }
        
        return trends;
    }

    // Helper to get category distribution
    private getCategoryDistribution(incidents: IIncident[]): any[] {
        const categories: Map<string, number> = new Map();
        
        incidents.forEach(incident => {
            const category = incident.category;
            categories.set(category, (categories.get(category) || 0) + 1);
        });

        return Array.from(categories.entries()).map(([category, count]) => ({
            category,
            count,
            percentage: (count / incidents.length) * 100,
        })).sort((a, b) => b.count - a.count);
    }
}
