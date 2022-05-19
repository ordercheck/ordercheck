/**
 * @swagger
 * /api/admin/info:
 *   get:
 *     tags:
 *       - admin
 *     summary: info
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/admin/plan/info:
 *   patch:
 *     tags:
 *       - admin
 *     summary: change plan info
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planIdx:
 *                 type: integer
 *               monthPrice:
 *                 type: integer
 *               yearPrice:
 *                 type: integer
 *               monthWhiteLabelPrice:
 *                 type: integer
 *               yearWhiteLabelPrice:
 *                 type: integer
 *               monthAnalyticsPrice:
 *                 type: integer
 *               yearAnalyticsPrice:
 *                 type: integer
 *               monthChatPrice:
 *                 type: integer
 *               yearChatPrice:
 *                 type: integer
 *               isManageMember:
 *                 type: boolean
 *               isInviteMember:
 *                 type: boolean
 *               isFileStorage:
 *                 type: boolean
 *               isAutoChargeMessage:
 *                 type: boolean
 *               maxConsultingForm:
 *                 type: integer
 *               maxAddCustomer:
 *                 type: integer
 *               maxFormCount:
 *                 type: integer
 *               maxFileStorageSize:
 *                 type: integer
 *               monthResultPrice:
 *                 type: integer
 *               yearResultPrice:
 *                 type: integer
 *             example:
 *               planIdx: 1
 *               monthPrice: 12312
 *               yearPrice: 123123
 *               monthWhiteLabelPrice: 123123123
 *               yearWhiteLabelPrice: 14123
 *               monthAnalyticsPrice: 34341
 *               yearAnalyticsPrice: 123412
 *               monthChatPrice: 123123
 *               yearChatPrice: 123123
 *               isManageMember: true
 *               isInviteMember: true
 *               isFileStorage: true
 *               isAutoChargeMessage: true
 *               maxConsultingForm: 1
 *               maxAddCustomer: 1
 *               maxFormCount: 1
 *               maxFileStorageSize: 1
 *               monthResultPrice: 123
 *               yearResultPrice: 12312
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
