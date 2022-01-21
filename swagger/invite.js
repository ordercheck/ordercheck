/**
 * @swagger
 * /api/invite/email:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 팀원 email로 초대
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_idx:
 *                 type: string
 *               target_email:
 *                 type: array
 *               company_url:
 *                 type: string
 *             example:
 *               company_idx: 1
 *               target_email: ["rlxo6919@naver.com","rlarlxo6919@daum.net"]
 *               company_url: "https://insplace.co.kr/"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
