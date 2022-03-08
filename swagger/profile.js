/**
 * @swagger
 * /api/info/user/del:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - profile
 *      summary: 계정 삭제
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             example:
 *               password: "비밀번호"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/info/user/check/del:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - profile
 *      summary: 계정 삭제 회사 가입 여부 체크
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패

 */
