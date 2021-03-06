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
 * /api/invite/SMS:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 팀원 SMS로 초대
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               target_phoneNumber:
 *                 type: array
 *               company_url:
 *                 type: string
 *             example:
 *               target_phoneNumber: ["010.6719.6919"]
 *               company_url: "https://insplace.co.kr/"
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
 * /api/invite/rejoin:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 승인 재요청하기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_subdomain:
 *                 type: string
 *             example:
 *               company_subdomain: '서브도메인'
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/invite/join/cancel:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 요청 취소하기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_subdomain:
 *                 type: string
 *             example:
 *               company_subdomain: '서브도메인'
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/invite/join/{company_subdomain}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - invite
 *      summary: 회사 가입 신청
 *      parameters:
 *         - in: path
 *           name: company_subdomain
 *           schema:
 *             type: string
 *           example: "company_subdomain"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
