import { Router } from "express";
import { listLeads, getLead, assignLead, logCall, updateLeadStatus, addRemark, overdueLeads, upcomingFollowUps, myTeamMembers, auditTrail } from "../controllers/leadController";
import { authenticate, requireRole, requirePermission, requireAdmin } from "../middleware/auth";

const router = Router();

const CRM_ROLES = ["super_admin", "sub_admin", "team_leader", "telecaller", "sales_agent"];

router.use(authenticate, requireRole(...CRM_ROLES), requirePermission("leads"));

router.get("/", listLeads);
router.get("/audit-trail", requireAdmin, auditTrail);
router.get("/overdue", overdueLeads);
router.get("/upcoming-followups", upcomingFollowUps);
router.get("/my-team", myTeamMembers);
router.get("/:id", getLead);
router.post("/:id/assign", assignLead);
router.post("/:id/call-log", logCall);
router.patch("/:id/status", updateLeadStatus);
router.post("/:id/remark", addRemark);

export default router;
