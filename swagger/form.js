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
 * /api/form/link/thumbNail/{formId}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form link thumbNail 업로드(FORM DATA)
 *     parameters:
 *         - in: path
 *           name: formId
 *           schema:
 *             type: integer
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/duplicate/{formId}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form 복사
 *     parameters:
 *         - in: path
 *           name: formId
 *           schema:
 *             type: integer
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/{formId}/:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form 삭제
 *     parameters:
 *         - in: path
 *           name: formId
 *           schema:
 *             type: integer
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
 * /api/form/link/search/{title}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  Form
 *      summary: form 제목으로 검색
 *      parameters:
 *         - in: path
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
 *     summary: form 제목 업데이트
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
 *            example:
 *              formId: "form idx"
 *              title: "title"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/thumbNail/{formId}/:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: formLink THumbNail 지우기
 *     parameters:
 *         - in: path
 *           name: formId
 *           schema:
 *             type: integer
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/update/title:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  Form
 *     summary: form 제목 변경
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
 *            example:
 *              formId: "form idx"
 *              title: "title"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/form/link/info/{form_link}:
 *   get:
 *     tags:
 *       -  Form
 *     summary: form_link로 정보 보여주기
 *     parameters:
 *         - in: path
 *           name: form_link
 *           schema:
 *             type: string
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
