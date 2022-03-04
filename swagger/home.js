/**
 * @swagger
 * /api/alarm:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - home
 *      summary: 알람 삭제하기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alarmId:
 *                 type: array
 *               time:
 *                 type: string
 *             example:
 *               alarmId: [1,2,3]
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
