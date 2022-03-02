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
 */
