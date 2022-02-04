/**
 * @swagger
 * /api/form/link/list:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  Form
 *      summary: 생성한 form들 보여주기
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/form/link:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form link만들기 (tempType이 1이면 tempType:1, tempType이 2이면 tempType:2 )
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *              tempType:
 *                type: integer
 *            example:
 *              title: "제목"
 *              tempType : 1
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/thumbNail:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form link thumbNail 업로드(FORM DATA)
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              file:
 *                type: string
 *              formId:
 *                type: integer
 *            example:
 *              file: "file"
 *              formId: "form idx"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/duplicate:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form 복사
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              formId:
 *                type: string
 *            example:
 *              formId: "form idx"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form 삭제
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              formId:
 *                type: string
 *            example:
 *              formId: "form idx"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/{formId}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  Form
 *      summary: form 상세보기
 *      parameters:
 *         - in: path
 *           name: formId
 *           schema:
 *             type: integer
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/form/link/search:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  Form
 *      summary: form 제목으로 검색
 *      parameters:
 *         - in: query
 *           name: title
 *           schema:
 *             type: string
 *           example: "제목"
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/form/link/update:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form 제목 화이트라벨 업데이트
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              formId:
 *                type: string
 *              title:
 *                type: string
 *              whiteLabelChecked:
 *                type: boolean
 *            example:
 *              formId: "form idx"
 *              title: "title"
 *              whiteLabelChecked: true
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
