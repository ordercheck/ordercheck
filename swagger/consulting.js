/**
 * @swagger
 * /api/consulting/:
 *   post:
 *     tags:
 *       -  consult
 *     summary: consulting 추가 api
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first:
 *                 type: string
 *               second:
 *                 type: string
 *               third:
 *                 type: string
 *               fourth:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               customer_phoneNumber:
 *                 type: string
 *               company_idx:
 *                 type: int
 *             example:
 *               first: "token"
 *               second: "token"
 *               third: "token"
 *               fourth: "token"
 *               customer_name: "김기태"
 *               customer_phoneNumber: "010-6719-6919"
 *               company_idx: 1
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/{company_idx}/{limit}/{page}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 회사 consult 조회(default)
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *         - in: path
 *           name: limit
 *           schema:
 *             type: integer
 *         - in: path
 *           name: page
 *           schema:
 *             type: integer
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/date/{company_idx}/{date}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: consult date 필터 api
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *         - in: path
 *           name: date
 *           schema:
 *             type: string
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/active/{company_idx}/{active}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: consult 상담 상태 필터 api
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *           example: 16
 *         - in: path
 *           name: active
 *           schema:
 *             type: string
 *           example: 상담 신청,상담완료,이슈
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/contract-possibility/{company_idx}/{contract_possibility}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: consult 계약 가능성 필터 api
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *           example: 16
 *         - in: path
 *           name: contract_possibility
 *           schema:
 *             type: string
 *           example: 없음,50%이상,50%미만
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/member/{company_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 같은 팀원 리스트 보기
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *           example: 16
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/member/set:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 팀원 consulting 담당자 설정
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idx:
 *                 type: int
 *               company_idx:
 *                 type: int
 *               contact_person:
 *                 type: int
 *             example:
 *               idx: 2
 *               company_idx: 16
 *               contact_person: 6
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: consulting 목록 삭제
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idx:
 *                 type: int
 *               company_idx:
 *                 type: int
 *             example:
 *               idx: 2
 *               company_idx: 16
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/customer:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  consult
 *     summary: consulting 고객 추가 api
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               detail_address:
 *                 type: string
 *               size:
 *                 type: integer
 *               customer_name:
 *                 type: string
 *               customer_phoneNumber:
 *                 type: string
 *               company_idx:
 *                 type: integer
 *               contact_person:
 *                 type: integer
 *             example:
 *               address: "경기도 광명"
 *               detail_address: "일직동"
 *               size: 7
 *               customer_name: "김기태"
 *               customer_phoneNumber: "010-6719-6919"
 *               company_idx: 1
 *               contact_person: 4
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/detail/{idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 회사별 컨설팅 상세보기
 *      parameters:
 *         - in: path
 *           name: idx
 *           schema:
 *             type: integer
 *           example: 3
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/customer/{company_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 회사별 고객정보 보기
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *           example: 16
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/status:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 상담 상태 변경 및 메모
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consulting_idx:
 *                 type: integer
 *               memo:
 *                 type: string
 *               status:
 *                 type: string
 *               company_idx:
 *                 type: integer
 *             example:
 *               consulting_idx: 1
 *               memo: test
 *               status: 상담중
 *               company_idx: 16
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/time/{company_idx}/{consulting_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 타임라인 보여주기
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *           example: 16
 *         - in: path
 *           name: consulting_idx
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/calculate:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *       -  consult
 *     summary: consulting 견적 업로드
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_idx:
 *                 type: integer
 *               pdf_data:
 *                 type: string
 *               pdf_name:
 *                 type: string
 *               title:
 *                 type: string
 *               predicted_price:
 *                 type: string
 *               consulting_idx:
 *                 type: string
 *             example:
 *               company_idx: 16
 *               pdf_data: 'base64'
 *               pdf_name: 'pdf 제목'
 *               title: '제1차 견적서'
 *               predicted_price: '1,000,000'
 *               consulting_idx: '1'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/calculate/{company_idx}/{consulting_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 견적서 보여주기
 *      parameters:
 *         - in: path
 *           name: company_idx
 *           schema:
 *             type: integer
 *           example: 16
 *         - in: path
 *           name: consulting_idx
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 */
