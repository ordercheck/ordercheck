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
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/consult/list:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 유저 상담 신청 내역 리스트
 *      parameters:
 *         - in: query
 *           name: sort
 *           schema:
 *             type: integer
 *           example: 0
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/login:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 유저 로그인
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_phoneNumber:
 *                 type: string
 *             example:
 *               customer_phoneNumber: "010.6719.6919"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/consult/{consulting_idx}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  myPage
 *     summary: 상담신청 디테일 보기
 *     parameters:
 *         - in: path
 *           name: consulting_idx
 *           schema:
 *             type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/calculate/list:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 유저 견적 리스트 가져오기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/calculate/set/favorites:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 견적서 즐겨찾기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calculate_idx:
 *                 type: integer
 *             example:
 *               calculate_idx: "1"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/calculate/unset/favorites:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 견적서 즐겨찾기 해제하기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calculate_idx:
 *                 type: integer
 *             example:
 *               calculate_idx: "1"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/calculate/favorites/list:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 유저 즐겨찾기 견적 리스트 가져오기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/mypage/customer/calculate/detail/{calculate_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - myPage
 *      summary: myPage 유저 견적 디테일 가져오기
 *      parameters:
 *         - in: path
 *           name: calculate_idx
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
