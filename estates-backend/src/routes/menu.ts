import { Router } from "express";
import { getPublicMenu, getAdminMenu, createMenuItem, updateMenuItem, deleteMenuItem, reorderMenu } from "../controllers/menuController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/menu:
 *   get:
 *     tags: [Menu]
 *     summary: Public active menu tree
 *     responses:
 *       200: { description: Nested menu tree }
 */
router.get("/", getPublicMenu);

/**
 * @openapi
 * /api/menu/admin:
 *   get:
 *     tags: [Menu]
 *     summary: Admin — flat list of all menu items (including inactive)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Flat menu item list }
 */
router.get("/admin", authenticate, requireAdmin, getAdminMenu);

/**
 * @openapi
 * /api/menu:
 *   post:
 *     tags: [Menu]
 *     summary: Create a menu item (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post("/", authenticate, requireAdmin, createMenuItem);

/**
 * @openapi
 * /api/menu/reorder:
 *   patch:
 *     tags: [Menu]
 *     summary: Bulk persist drag-and-drop tree order (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Updated flat list }
 */
router.patch("/reorder", authenticate, requireAdmin, reorderMenu);

/**
 * @openapi
 * /api/menu/{id}:
 *   put:
 *     tags: [Menu]
 *     summary: Update a menu item (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Menu]
 *     summary: Delete a menu item and its descendants (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.put("/:id", authenticate, requireAdmin, updateMenuItem);
router.delete("/:id", authenticate, requireAdmin, deleteMenuItem);

export default router;
