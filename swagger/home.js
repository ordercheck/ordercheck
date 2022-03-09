/**
 * @swagger
 * /api/home:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - home
 *      summary: home화면 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/store/root:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - home
 *      summary: 브레드 저장
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bread:
 *                 type: string
 *             example:
 *               bread: "bread"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/store/root/{breadId}:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - home
 *      summary: 브레드 삭제
 *      parameters:
 *         - in: path
 *           name: breadId
 *           schema:
 *             type: integer
 *           example: 1
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bread:
 *                 type: string
 *             example:
 *               bread: "bread"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
