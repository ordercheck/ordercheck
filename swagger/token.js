/**
 * @swagger
 * /api/create/token:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 전화번호 회원가입 1단계 토큰 생성
 *     requestBody:
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
 *             example:
 *               user_phone: '010-6719-6919'
 *               user_password: 'rlxo12345'
 *               user_email: 'rlxo6919@naver.com'
 *               user_name: '김기태'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/create/token/data:
 *   post:
 *     tags:
 *       - Token
 *     summary: 데이터를 Token으로 만들기
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/decode/token/data:
 *   post:
 *     tags:
 *       - Token
 *     summary: 데이터를 Token을 decode하기
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
