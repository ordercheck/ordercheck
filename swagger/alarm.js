/**
 * @swagger
 * /api/alarm/{alarmId}:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - alarm
 *      summary: 알람 삭제하기
 *      parameters:
 *         - in: path
 *           name: alarmId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/alarm/confirm:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - alarm
 *      summary: 알람 확인처리
 *      requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              alamId:
 *                type: array
 *            example:
 *              alamId: [1,2,3]
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/alarm/repeat:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - alarm
 *      summary: 나중에 다시 알람
 *      requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              alamId:
 *                type: integer
 *            example:
 *              alamId: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
