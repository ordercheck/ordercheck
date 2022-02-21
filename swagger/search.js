/**
 * @swagger
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
 *         - in: query
 *           name: PhoneNumber
 *           schema:
 *             type: integer
 *           example: 0
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/file/store/search:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 고객명, 연락처, 폴더.파일명으로 검색
 *     parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           example: "Title"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
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
 *         - in: query
 *           name: PhoneNumber
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
 * /api/total/search:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  total search
 *     summary: 통합검색
 *     parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           example: "Title"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
