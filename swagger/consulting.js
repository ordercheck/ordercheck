/**
 * @swagger
 * /api/consulting/:
 *   post:
 *     tags:
 *       -  consult
 *     summary: consulting 추가 api (FORM DATA)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                choice:
 *                 type: string
 *                address:
 *                 type: string
 *                detail_address:
 *                 type: string
 *                building_type:
 *                  type: string
 *                size:
 *                  type: integer
 *                elv:
 *                  type: string
 *                hope_Date:
 *                  type: string
 *                predicted_living:
 *                  type: string
 *                budget:
 *                  type: string
 *                customer_name:
 *                  type: string
 *                customer_phoneNumber:
 *                  type: string
 *                form_link:
 *                  type: string
 *             example:
 *                choice: "창호"
 *                address: "경기도 광명"
 *                detail_address: "일직동"
 *                building_type: "아파트"
 *                size: 24
 *                elv: "true"
 *                hope_Date: "2022.01.06"
 *                predicted_living : "2022.01.07"
 *                budget: "1,000만원"
 *                customer_name: "김기태"
 *                customer_phoneNumber : "010-6719-6919"
 *                form_link : "oe2n87z209"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/{form_link}/{limit}/{page}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: 회사 consult 조회(default)
 *      parameters:
 *         - in: path
 *           name: form_link
 *           schema:
 *             type: string
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
 * /api/consulting/date/{form_link}/{date}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult filter
 *      summary: consult date 필터 api
 *      parameters:
 *         - in: path
 *           name: form_link
 *           schema:
 *             type: string
 *           example: "lsidjfsdil"
 *         - in: path
 *           name: date
 *           schema:
 *             type: string
 *           example: "2021.09.30 - 2021.09.30"
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/active/{form_link}/{active}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult filter
 *      summary: consult 상담 상태 필터 api
 *      parameters:
 *         - in: path
 *           name: form_link
 *           schema:
 *             type: string
 *           example: "sldfjd"
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
 * /api/consulting/contract-possibility/{form_link}/{contract_possibility}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult filter
 *      summary: consult 계약 가능성 필터 api
 *      parameters:
 *         - in: path
 *           name: form_link
 *           schema:
 *             type: string
 *           example: "sldkjfd"
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
 *       -  consult get info
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
 *               form_link:
 *                 type: string
 *             example:
 *               idx: 2
 *               form_link: "sdfsdd"
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
 *               form_link:
 *                 type: string
 *               contact_person:
 *                 type: integer
 *             example:
 *               address: "경기도 광명"
 *               detail_address: "일직동"
 *               size: 7
 *               customer_name: "김기태"
 *               customer_phoneNumber: "010-6719-6919"
 *               form_link: "lsdfjlsd"
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
 *       -  consult get info
 *      summary: 컨설팅 상세보기
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
 * /api/consulting/customer/{form_link}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: 고객정보 보기 모두
 *      parameters:
 *         - in: path
 *           name: form_link
 *           schema:
 *             type: string
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
 *               form_link:
 *                 type: string
 *             example:
 *               consulting_idx: 1
 *               memo: test
 *               status: 상담중
 *               form_link: 'sdfsdf'
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
 *       -  consult get info
 *      summary: 타임라인 보여주기 (사용 x)
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
 *       -  consult calculate
 *     summary: consulting 견적 업로드 (FORM DATA)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               form_link:
 *                 type: string
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
 *               form_link: 'sdfsdf'
 *               img: 견적서file
 *               pdf_name: 'pdf 제목'
 *               title: '제1차 견적서'
 *               predicted_price: '1,000,000'
 *               consulting_idx: '1'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/calculate/{form_link}/{consulting_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult calculate
 *      summary: 견적서 보여주기
 *      parameters:
 *         - in: path
 *           name: form_link
 *           schema:
 *             type: string
 *           example: 'sdfsdf'
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
 * /api/consulting/calculate/down:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  consult calculate
 *     summary: 견적서 pdf 다운로드
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url_idx:
 *                 type: string
 *             example:
 *               url_idx: 6
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/integrated/user:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  consult
 *     summary: 같은 전화번호 고객 보여주기
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              customer_phoneNumber:
 *                type: string
 *            example:
 *               customer_phoneNumber: "010-6719-6919"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/integrated/user/:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  consult
 *     summary: 같은 번호 고객 통합하기
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              form_link:
 *                type: string
 *              main_idx:
 *                type: integer
 *              target_idx:
 *                type: array
 *            example:
 *               form_link: "skldfkdjf"
 *               main_idx: 4
 *               target_idx: [1,2,3]
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/filter:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: consult 조회
 *      parameters:
 *         - in: query
 *           name: form_link
 *           schema:
 *             type: string
 *           example: 1
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *           example: 10
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *           example: 1
 *         - in: query
 *           name: date
 *           schema:
 *             type: string
 *           example: "2021.09.30 - 2021.09.30"
 *         - in: query
 *           name: active
 *           schema:
 *             type: string
 *           example: "상담 신청,상담완료,이슈"
 *         - in: query
 *           name: contract_possibility
 *           schema:
 *             type: string
 *           example: "없음,50%이상,50%미만"
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 */
