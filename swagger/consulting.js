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
 * /api/consulting/customer/list/{limit}/{page}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: consult 조회(default)
 *      parameters:
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
 * /api/consulting/date/{date}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult filter
 *      summary: consult date 필터 api
 *      parameters:
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
 * /api/consulting/active/{active}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult filter
 *      summary: consult 상담 상태 필터 api
 *      parameters:
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
 * /api/consulting/contract-possibility/{contract_possibility}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult filter
 *      summary: consult 계약 가능성 필터 api
 *      parameters:
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
 * /api/consulting/member:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: 같은 팀원 리스트 보기
 *      parameters:
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
 *               contact_person:
 *                 type: int
 *             example:
 *               idx: 2
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
 *               contact_person:
 *                 type: integer
 *             example:
 *               address: "경기도 광명"
 *               detail_address: "일직동"
 *               size: 7
 *               customer_name: "김기태"
 *               customer_phoneNumber: "010-6719-6919"
 *               contact_person: 4
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/detail/{customer_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: 컨설팅 상세보기
 *      parameters:
 *         - in: path
 *           name: customer_idx
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
 *      summary: 고객정보 보기 모두 (사용x)
 *      parameters:
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
 *               customer_idx:
 *                 type: integer
 *               memo:
 *                 type: string
 *               status:
 *                 type: string
 *             example:
 *               customer_idx: 1
 *               memo: test
 *               status: 상담중
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/time/{consulting_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: 타임라인 보여주기 (사용 x)
 *      parameters:
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
 *               img:
 *                 type: string
 *               title:
 *                 type: string
 *               predicted_price:
 *                 type: string
 *               customer_idx:
 *                 type: string
 *             example:
 *               img: 견적서file
 *               title: '제1차 견적서'
 *               predicted_price: '1,000,000'
 *               customer_idx: '1'
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/calculate/{customer_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult calculate
 *      summary: 견적서 보여주기
 *      parameters:
 *         - in: path
 *           name: customer_idx
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
 *      summary: consult filter 결과 조회
 *      parameters:
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
 * /api/consulting/create/form-link:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  consult
 *     summary: form link만들기 (form type이 1이면 form_type:1, 2이면 form_type:2 )
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              form_type:
 *                type: 1
 *            example:
 *              form_type: 1
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/customer/search:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: consult 고객 통합검색
 *      parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           example: '김기태'
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 */
