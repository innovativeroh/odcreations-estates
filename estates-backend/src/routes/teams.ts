import { Router } from "express";
import { listTeams, getTeam, createTeam, updateTeam, deleteTeam } from "../controllers/teamController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", listTeams);
router.get("/:id", getTeam);
router.post("/", createTeam);
router.patch("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
