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
 *              title:
 *                type: string
 *              folder_idx:
 *                type: integer
 *            example:
 *              title: "test"
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
 * /api/file/store/update/title/{customerFile_idx}:
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
 *              uuid:
 *                type: integer
 *              title:
 *                type: string
 *              root:
 *                type: boolean
 *            example:
 *              uuid: SJFD
 *              title: "test2"
 *              root: true
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
 * /api/file/store/file:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 파일,폴더 삭제하기
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              idx:
 *                type: integer
 *              isfolder:
 *                type: boolean
 *              uuid:
 *                type: string
 *            example:
 *              idx: 1
 *              isfolder: true
 *              uuid: FEJE
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
