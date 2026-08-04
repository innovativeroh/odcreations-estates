import { Router } from "express";
import { getDashboardStats, getTelecallerDashboard, getTeamLeaderDashboard, getSalesDashboard } from "../controllers/dashboardController";
import { authenticate, requireAdmin, requireRole } from "../middleware/auth";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get admin dashboard statistics
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProperties: { type: integer }
 *                 totalUsers: { type: integer }
 *                 totalEnquiries: { type: integer }
 *                 totalAgents: { type: integer }
 */
router.get("/stats", requireAdmin, getDashboardStats);
router.get("/telecaller", requireRole("telecaller", "super_admin"), getTelecallerDashboard);
router.get("/team-leader", requireRole("team_leader", "super_admin"), getTeamLeaderDashboard);
router.get("/sales", requireRole("sales_agent", "super_admin"), getSalesDashboard);

export default router;
