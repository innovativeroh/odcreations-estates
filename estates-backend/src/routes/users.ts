import { Router } from "express";
import { getProfile, updateProfile, changePassword, getSavedProperties, toggleSavedProperty, getMyEnquiries, listUsers, createUser, adminGetUser, adminUpdateUser, adminDeleteUser } from "../controllers/userController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 *   put:
 *     tags: [Users]
 *     summary: Update own profile
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 */
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

/**
 * @openapi
 * /api/users/password:
 *   put:
 *     tags: [Users]
 *     summary: Change own password
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Password changed }
 */
router.put("/password", changePassword);

/**
 * @openapi
 * /api/users/saved:
 *   get:
 *     tags: [Users]
 *     summary: Get saved properties
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Saved properties list }
 */
router.get("/saved", getSavedProperties);

/**
 * @openapi
 * /api/users/saved/{propertyId}:
 *   post:
 *     tags: [Users]
 *     summary: Save a property
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Saved }
 *   delete:
 *     tags: [Users]
 *     summary: Unsave a property
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Unsaved }
 */
router.post("/saved/:propertyId", toggleSavedProperty);
router.delete("/saved/:propertyId", toggleSavedProperty);

/**
 * @openapi
 * /api/users/enquiries:
 *   get:
 *     tags: [Users]
 *     summary: Get own enquiries
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Enquiry list }
 */
router.get("/enquiries", getMyEnquiries);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: User list }
 */
router.get("/", requireAdmin, listUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a CRM-role user account (super admin only)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: User created }
 */
router.post("/", requireAdmin, createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User detail }
 *   patch:
 *     tags: [Users]
 *     summary: Update user (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
router.get("/:id", requireAdmin, adminGetUser);
router.patch("/:id", requireAdmin, adminUpdateUser);
router.delete("/:id", requireAdmin, adminDeleteUser);

export default router;
