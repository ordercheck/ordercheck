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
 *               user_password:
 *                 type: string
 *               reason:
 *                 type: string
 *             example:
 *               user_password: "비밀번호"
 *               reason: "탈퇴 사유"
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
 * /api/info/company/exit:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - profile
 *      summary: 회사 나가기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_password:
 *                 type: string
 *             example:
 *               user_password: "비밀번호"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/info/user/profile:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - profile
 *      summary: 유저 프로필 이미지 등록하기 (formData)
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
 * /api/info/user/profile/:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - profile
 *      summary: 회사 프로필 이미지 삭제하기
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
 *               user_name:
 *                 type: string
 *               user_password:
 *                 type: string
 *               user_email:
 *                 type: string
 *             example:
 *               user_name: "이름"
 *               user_password: "비밀번호"
 *               user_email: "이메일"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/info/user/alarm/config:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 알람 설정 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/info/user/alarm/config/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 알람 설정 수정하기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productServiceAlarm:
 *                 type: integer
 *               promotionAlarm:
 *                 type: integer
 *               customerStatusAlarm:
 *                 type: integer
 *               addConsultingAlarm:
 *                 type: integer
 *             example:
 *               productServiceAlarm: 1
 *               promotionAlarm: 1
 *               customerStatusAlarm: 2
 *               addConsultingAlarm: 2
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
