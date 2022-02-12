/**
 * @swagger
 * /api/file/store/customer/list:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  FileStore
 *      summary: 파일보관함 고객 list보여주기
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/file/store/folder/{customerFile_idx}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  FileStore
 *      summary: 파일보관함 고객 folder 보여주기
 *      parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/file/store/folder/{customerFile_idx}/:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 폴더 생성하기 (root폴더 = folder_idx:0, )
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              folder_name:
 *                type: string
 *              folder_idx:
 *                type: integer
 *            example:
 *              folder_name: "test"
 *              folder_idx: 0
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: 1
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/upload/{customerFile_idx}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 파일 업로드 하기(FOM DATA)
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              folder_idx:
 *                type: string
 *              file:
 *                type: string
 *            example:
 *              folder_idx: 1
 *              file: "file"
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/{customerFile_idx}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 파일 보여주기
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              folder_idx:
 *                type: string
 *            example:
 *              folder_idx: 1
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/update/title:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 폴더 제목 변경하기
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              folder_idx:
 *                type: array
 *              title:
 *                type: string
 *              before_title:
 *                type: string
 *            example:
 *              folder_idx: [1,2,3,4]
 *              before_title : "test"
 *              title: "test2"
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
