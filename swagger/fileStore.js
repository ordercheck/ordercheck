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
 * /api/file/store/folder/{customerFile_idx}/{sort_field}/{sort}:
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
 *         - in: path
 *           name: sort_field
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: path
 *           name: sort
 *           schema:
 *             type: integer
 *           example: 0
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
 *     summary: 폴더 생성하기
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *              uuid:
 *                type: string
 *              root:
 *                type: boolean
 *            example:
 *              title: "test"
 *              uuid: "SJDI"
 *              root: true
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
 *              uuid:
 *                type: string
 *              file:
 *                type: string
 *            example:
 *              uuid: "DJFI"
 *              file: "file"
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *         - in: query
 *           name: path
 *           schema:
 *             type: string
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/{customerFile_idx}/{sort_field}/{sort}:
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
 *              uuid:
 *                type: string
 *            example:
 *              uuid: "FJEIF"
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *         - in: path
 *           name: sort_field
 *           schema:
 *             type: integer
 *           example: 0
 *         - in: path
 *           name: sort
 *           schema:
 *             type: integer
 *           example: 0
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
 *              isFolder:
 *                type: boolean
 *            example:
 *              uuid: SJFD
 *              title: "test2"
 *              isFolder: true
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *         - in: query
 *           name: path
 *           schema:
 *             type: string
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/file/{customerFile_idx}/{isfolder}/{uuid}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 파일,폴더 삭제하기 (folder면 isfolder 1 아니면 0)
 *     parameters:
 *         - in: path
 *           name: isfolder
 *           schema:
 *             type: integer
 *           example: 1
 *         - in: path
 *           name: uuid
 *           schema:
 *             type: string
 *           example: SKFEO
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *           example: 1
 *         - in: query
 *           name: path
 *           schema:
 *             type: string
 *           example: SKFEO/SFEF
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
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
 * /api/file/store/detail/{customerFile_idx}/{uuid}/{isFolder}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: file, folder detail정보 보기 (folder면 isfolder 1 아니면 0)
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *           example: 1
 *         - in: path
 *           name: uuid
 *           schema:
 *             type: string
 *           example: SJFIO
 *         - in: path
 *           name: isFolder
 *           schema:
 *             type: string
 *           example: 1
 *         - in: query
 *           name: path
 *           schema:
 *             type: string
 *           example: FJEO
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/folders/root/{customerFile_idx}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 고객 root폴더 보여주기(폴더이동)
 *     parameters:
 *         - in: path
 *           name: customerFile_idx
 *           schema:
 *             type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/folders/{uuid}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 폴더 안의 폴더 보여주기
 *     parameters:
 *         - in: path
 *           name: uuid
 *           schema:
 *             type: string
 *           example: sldfsnd
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/file/store/folders/move/{fileUuid}/{folderUuid}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       -  FileStore
 *     summary: 폴더 이동하기
 *     parameters:
 *         - in: path
 *           name: fileUuid
 *           schema:
 *             type: string
 *           example: sldfsnd
 *         - in: path
 *           name: folderUuid
 *           schema:
 *             type: string
 *           example: sldfsnd
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
