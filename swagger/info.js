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
 * /api/config/company:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 정보 조회
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/config/company/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 정보 변경
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               company_subdomain:
 *                 type: string
 *               address:
 *                 type: string
 *               detail_address:
 *                 type: string
 *               business_number:
 *                 type: string
 *             example:
 *               company_name: "회사명"
 *               company_subdomain: "서브도메인"
 *               address: "주소"
 *               detail_address: "상세주소"
 *               business_number: "사업자 번호"
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
 * /api/config/company/logo:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 로고 등록 및 변경(form Data)
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
 * /api/config/company/enrollment:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 사업자 등록증 등록 및 변경(form Data)
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *             example:
 *               file: "file"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/member:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 같은 팀원 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/search/member/:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 같은 팀원 검색하기
 *      parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           example: "김기태"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/member/{memberId}:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 팀원 삭제하기
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
 * /api/config/company/template:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 권한 템플릿 가져오기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
