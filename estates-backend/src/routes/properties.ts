import { Router } from "express";
import { listProperties, adminListProperties, getProperty, createProperty, updateProperty, deleteProperty, approveProperty, rejectProperty, submitEnquiry, trackContact, reportProperty, getSimilarProperties, getNearbyLocalities } from "../controllers/propertyController";
import { authenticate, requireAdmin, requireAgentOrAdmin, optionalAuth } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/properties/admin/all:
 *   get:
 *     tags: [Properties]
 *     summary: Admin — list all properties regardless of status
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: All properties }
 */
router.get("/admin/all", authenticate, requireAdmin, adminListProperties);

/**
 * @openapi
 * /api/properties:
 *   get:
 *     tags: [Properties]
 *     summary: List approved properties (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Paginated property list }
 *   post:
 *     tags: [Properties]
 *     summary: Create a property listing (agent/admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Property created }
 */
router.get("/", listProperties);
router.post("/", authenticate, requireAgentOrAdmin, createProperty);

/**
 * @openapi
 * /api/properties/{id}:
 *   get:
 *     tags: [Properties]
 *     summary: Get single property (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Property detail }
 *       404: { description: Not found }
 *   put:
 *     tags: [Properties]
 *     summary: Update property (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Properties]
 *     summary: Delete property (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
router.get("/:id", getProperty);
router.put("/:id", authenticate, requireAdmin, updateProperty);
router.delete("/:id", authenticate, requireAdmin, deleteProperty);

/**
 * @openapi
 * /api/properties/{id}/approve:
 *   patch:
 *     tags: [Properties]
 *     summary: Approve a property (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Approved }
 * /api/properties/{id}/reject:
 *   patch:
 *     tags: [Properties]
 *     summary: Reject a property (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Rejected }
 * /api/properties/{id}/enquire:
 *   post:
 *     tags: [Properties]
 *     summary: Submit an enquiry on a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               message: { type: string }
 *     responses:
 *       201: { description: Enquiry submitted }
 */
router.patch("/:id/approve", authenticate, requireAdmin, approveProperty);
router.patch("/:id/reject", authenticate, requireAdmin, rejectProperty);
router.post("/:id/enquire", optionalAuth, submitEnquiry);
router.post("/:id/contact", trackContact);
router.post("/:id/report", reportProperty);
router.get("/:id/similar", getSimilarProperties);
router.get("/:id/nearby-localities", getNearbyLocalities);

export default router;
