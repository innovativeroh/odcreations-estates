import { Router } from "express";
import { listEnquiries, getPropertyEnquiries, updateEnquiryStatus, deleteEnquiry } from "../controllers/enquiryController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/enquiries:
 *   get:
 *     tags: [Enquiries]
 *     summary: List all enquiries (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Enquiry list }
 */
router.get("/", authenticate, requireAdmin, listEnquiries);

/**
 * @openapi
 * /api/enquiries/property/{propertyId}:
 *   get:
 *     tags: [Enquiries]
 *     summary: Get enquiries for a property (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Enquiries for property }
 */
router.get("/property/:propertyId", authenticate, requireAdmin, getPropertyEnquiries);

/**
 * @openapi
 * /api/enquiries/{id}/status:
 *   patch:
 *     tags: [Enquiries]
 *     summary: Update enquiry status (admin)
 *     security: [{ cookieAuth: [] }]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, contacted, closed] }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch("/:id/status", authenticate, requireAdmin, updateEnquiryStatus);

/**
 * @openapi
 * /api/enquiries/{id}:
 *   delete:
 *     tags: [Enquiries]
 *     summary: Delete enquiry (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
router.delete("/:id", authenticate, requireAdmin, deleteEnquiry);

export default router;
