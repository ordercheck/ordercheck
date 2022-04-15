/**
 * @swagger
 * /api/mypage/customer/join/do:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 유저 회원가입
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_name:
 *                 type: string
 *               customer_phoneNumber:
 *                 type: string
 *               use_agree:
 *                 type: boolean
 *               private_agree:
 *                 type: boolean
 *               marketing_agree:
 *                 type: boolean
 *             example:
 *               customer_name: "이름"
 *               customer_phoneNumber: "핸드폰 번호"
 *               use_agree: "서비스 이용 약관 동의"
 *               private_agree: "개인정보 수집 및 이용 동의"
 *               marketing_agree: "마케팅 정보 수신 및 동의(선택)"
 *
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/home:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 유저 home화면
s *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
