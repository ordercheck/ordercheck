/**
 * @swagger
 * /api/info/user:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 유저 프로필 조회
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/info/company:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 회사 정보 조회
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/info/company/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 회사 정보 변경
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_phoneNumber:
 *                 type: string
 *             example:
 *               customer_phoneNumber: "010-6719-6919"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/info/user/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 유저 정보 변경
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_phoneNumber:
 *                 type: string
 *             example:
 *               customer_phoneNumber: "010-6719-6919"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/info/company/logo:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 회사 로고 변경(form Data)
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *             example:
 *               img: "img"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
