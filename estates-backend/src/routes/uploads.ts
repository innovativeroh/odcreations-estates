import { Router } from "express";
import { getUploadUrl, deleteFile } from "../controllers/uploadController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/uploads/presign:
 *   post:
 *     tags: [Uploads]
 *     summary: Get a presigned URL for Cloudflare R2 upload
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filename, contentType]
 *             properties:
 *               filename: { type: string }
 *               contentType: { type: string }
 *     responses:
 *       200:
 *         description: Presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string }
 *                 key: { type: string }
 */
router.post("/presign", getUploadUrl);

/**
 * @openapi
 * /api/uploads:
 *   delete:
 *     tags: [Uploads]
 *     summary: Delete a file from R2 (admin)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key]
 *             properties:
 *               key: { type: string }
 *     responses:
 *       204: { description: File deleted }
 */
router.delete("/", requireAdmin, deleteFile);

export default router;
