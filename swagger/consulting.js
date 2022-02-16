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
 *      summary: 모든 consult data 조회 (0이 오름차순 1이 내림차순)
 *      parameters:
 *         - in: path
 *           name: limit
 *           schema:
 *             type: integer
 *         - in: path
 *           name: page
 *           schema:
 *             type: integer
 *         - in: query
 *           name: No
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Name
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Address
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Date
 *           schema:
 *             type: integer
 *           example: 0
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
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/member/set/{customer_idx}/{contract_person}:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: consulting 담당자 설정
 *      parameters:
 *         - in: path
 *           name: customer_idx
 *           schema:
 *             type: integer
 *         - in: path
 *           name: contract_person
 *           schema:
 *             type: integer
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/consulting/{customer_idx}:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 고객 삭제
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
 * /api/consulting/status/{customer_idx}:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult
 *      summary: 상담 상태 변경 및 메모
 *      parameters:
 *         - in: path
 *           name: customer_idx
 *           schema:
 *             type: integer
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contract_possibility:
 *                 type: integer
 *               contact_person:
 *                 type: integer
 *               detail_address:
 *                 type: string
 *               address:
 *                 type: string 
 *               customer_phoneNumber:
 *                 type: string 
 *               customer_name: 
 *                 type: string 
 *               memo:
 *                 type: string
 *               status:
 *                 type: integer
 *               room_size:
 *                 type: integer 
 *               room_size_kind:
 *                 type: integer
 *             example:
 *               room_size_kind: 1
 *               room_size: 24
 *               contract_possibility: 2
 *               contact_person: 1
 *               detail_address: "금동구"
 *               address: "서울광역시"
 *               customer_phoneNumber: "010-6719-6919"
 *               customer_name: "김기태"
 *               memo: test
 *               status: 0
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
 *              main_idx:
 *                type: integer
 *              target_idx:
 *                type: array
 *            example:
 *               main_idx: 4
 *               target_idx: [1,2,3]
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/consulting/form-link/list:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: 생성한 form들 보여주기
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 *
 * /api/consulting/customer/search/{limit}/{page}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  consult get info
 *      summary: consult 고객 통합검색 (0이 오름차순 1이 내림차순)
 *      parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           example: '김기태'
 *         - in: query
 *           name: No
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Name
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Address
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Date
 *           schema:
 *             type: integer
 *           example: 0
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
 * /api/consulting/filter/{limit}/{page}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  consult get info
 *     summary: consulting filter하기 (0이 오름차순 1이 내림차순)
 *     parameters:
 *         - in: path
 *           name: limit
 *           schema:
 *             type: integer
 *         - in: path
 *           name: page
 *           schema:
 *             type: integer    
 *         - in: query
 *           name: No
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Name
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Address
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: query
 *           name: Date
 *           schema:
 *             type: integer
 *           example: 0 
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              date:
 *                type: string
 *              status:
 *                type: array
 *              contract_possibility:
 *                type: array
 *              userId:
 *                type: array
 *              confirm:
 *                type: boolean
 *            example:
 *               date: "2022.02.04 - 2022.02.10"
 *               status: [0,1]
 *               contract_possibility: [0,1]
 *               userId: [null,2,3,5,6]
 *               confirm: false
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패

 */
