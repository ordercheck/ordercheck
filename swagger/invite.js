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
 *               target_email:
 *                 type: array
 *               company_url:
 *                 type: string
 *             example:
 *               target_email: ["rlxo6919@naver.com","rlarlxo6919@daum.net"]
 *               company_url: "https://insplace.co.kr/"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/invite/join/company:
 *   post:
 *      tags:
 *       - invite
 *      summary: email받은 팀원 회사 참여 신청
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *               user_email:
 *                 type: string
 *               user_password:
 *                 type: string
 *               user_name:
 *                 type: string
 *               company_subdomain:
 *                 type: string
 *             example:
 *               user_phone: '010-6719-6919'
 *               user_password: 'rlxo12345'
 *               user_email: 'rlxo6919@naver.com'
 *               user_name: '김기태'
 *               company_subdomain: 'subdomain'
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/invite/standby:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 회사 가입 신청 대기 인원 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/invite/join/do/{memberId}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 회사 가입 신청 허가
 *      parameters:
 *         - in: path
 *           name: memberId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/invite/refuse/{memberId}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 회사 가입 거절
 *      parameters:
 *         - in: path
 *           name: memberId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
