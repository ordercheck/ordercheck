/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - 로그인
 *     summary: 로그인
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *               user_password:
 *                 type: string
 *               company_subdomain:
 *                 type: string
 *             example:
 *               user_phone: '010.6719.6919'
 *               user_password: 'rlxo12345'
 *               company_subdomain: '도메인'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/join/check:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 전화번호 회원가입 2단계 SNS체크
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *               user_phone:
 *                 type: string
 *             example:
 *               user_email: 'rlxo6919@naver.com'
 *               user_phone: '010.6719.6919'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/join/do:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 전화번호 회원가입 최종
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               use_agree:
 *                 type: boolean
 *               private_agree:
 *                 type: boolean
 *               marketing_agree:
 *                 type: boolean
 *               company_subdomain:
 *                 type: string
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3Bob25lIjoiMDEwLTY3MTktNjkxOSIsInVzZXJfZW1haWwiOiJybHhvNjkxOUBuYXZlci5jb20iLCJ1c2VyX3Bhc3N3b3JkIjoicmx4bzEyMzQ1IiwidXNlcl9uYW1lIjoi6rmA6riw7YOcIiwiaWF0IjoxNjQzMjY4NzIwfQ.R8IV5vNo-CfEvIKrRYgycFV99nKsOMOeVpzVnCbq8Wg"
 *               use_agree: true
 *               private_agree: true
 *               marketing_agree: true
 *               company_subdomain: "도메인"
 * responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/company/check:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 회사등록
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ut:
 *                type: string
 *               ct:
 *                type: string
 *               company_name:
 *                type: string
 *               company_subdomain:
 *                type: string
 *               planIdx:
 *                type: integer
 *               whiteLabelChecked:
 *                type: boolean
 *               chatChecked:
 *                type: boolean
 *               analysticChecked:
 *                type: boolean
 *               payType:
 *                type: string
 *             example:
 *               planIdx: 1
 *               whiteLabelChecked: true
 *               chatChecked: true
 *               analysticChecked: true
 *               payType: "month"
 *               ut: "userToken"
 *               ct: "cardToken"
 *               company_name: "회사 이름"
 *               company_subdomain: "회사 서브 도메인"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/phone/check:
 *   post:
 *     tags:
 *       - 핸드폰 인증
 *     summary: 핸드폰번호 등록 여부
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *             example:
 *               user_phone: '010.6719.6919'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/password/reset:
 *   post:
 *     tags:
 *       - 비밀번호 수정
 *     summary: 패스워드 변경
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *               user_password:
 *                 type: string
 *             example:
 *               user_phone: '010.6719.6919'
 *               user_password: 'rlxo12345'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/duplicate/phoneNumber:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 핸드폰 중복 체크
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *             example:
 *               user_phone: '010.6719.6919'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/duplicate/email:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 이메일 중복 체크
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *             example:
 *               user_phone: 'rlxo6919@naver.com'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/join/do/login:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 회원가입 후 바로 로그인 시키기 (사용 x)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *             example:
 *               token: 'token'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/check/pw:
 *   post:
 *     tags:
 *       - 비밀번호 찾기
 *     summary: 비밀번호 찾기에서 인증번호 보내기
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *             example:
 *               user_phone: '010-6719-6919'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/check/subdomain:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 중복된 회사 도메인 찾기
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_subdomain:
 *                 type: string
 *             example:
 *               company_subdomain: 'subdomain'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/check/company-name:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 중복된 회사 이름 찾기
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *             example:
 *               company_name: 'company_name'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/check/password:
 *   post:
 *     tags:
 *       - 비밀번호 수정
 *     summary: 중복된 비밀번호 여부 확인
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_phone:
 *                 type: string
 *               user_password:
 *                 type: string
 *             example:
 *               user_phone: "010-6719-6919"
 *               user_password: 'user_password'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/company/check/later:
 *   post:
 *     tags:
 *       - 회원가입
 *     summary: 나중에 회사등록하기
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ut:
 *                type: string
 *               ct:
 *                type: string
 *               pt:
 *                type: string
 *             example:
 *               ut: "userToken"
 *               ct: "cardToken"
 *               pt: "planToken"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/token/login:
 *   post:
 *     tags:
 *       - 로그인
 *     summary: 유저 토큰으로 로그인 하기
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ut:
 *                 type: string
 *             example:
 *               ut: 'token'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
