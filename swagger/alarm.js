/**
 * @swagger
 * /api/alarm/del:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - alarm
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
 * /api/alarm/confirm:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - alarm
 *      summary: 알람 확인처리
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alarmId:
 *                 type: array
 *             example:
 *               alarmId: [1,2,3]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alarmId:
 *                 type: integer
 *               time:
 *                 type: string
 *             example:
 *               alarmId: 1
 *               time: 2022-03-02 02:13
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
