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
 *              idx:
 *                type: integer
 *            example:
 *              file: "file"
 *              idx: "form idx"
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
