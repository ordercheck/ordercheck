/**
 * @swagger
 * /api/send/sms:
 *   post:
 *     tags:
 *       - SMS
 *     summary: SMS
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
