/**
 * @swagger
 * /api/tutorial/reload:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - tutorial
 *      summary: tutorial 다시보지않기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                reloadType:
 *                 type: string
 *             example:
 *                reloadType: "tutorialCompanyInfo"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
