import { Router } from "express";
import { listAgents, createAgent, toggleAgentStatus, deleteAgent, updateAgent } from "../controllers/agentController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireAdmin);

/**
 * @openapi
 * /api/agents:
 *   get:
 *     tags: [Agents]
 *     summary: List all agents (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Agent list }
 *   post:
 *     tags: [Agents]
 *     summary: Create an agent (admin)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Agent created }
 */
router.get("/", listAgents);
router.post("/", createAgent);

/**
 * @openapi
 * /api/agents/{id}:
 *   put:
 *     tags: [Agents]
 *     summary: Update agent (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Agents]
 *     summary: Delete agent (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 * /api/agents/{id}/toggle:
 *   patch:
 *     tags: [Agents]
 *     summary: Toggle agent active status (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Status toggled }
 */
router.put("/:id", updateAgent);
router.patch("/:id/toggle", toggleAgentStatus);
router.delete("/:id", deleteAgent);

export default router;
