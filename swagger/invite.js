/**
 * @swagger
 * /api/invite:
 *   post:
 *     tags:
 *       -  consult
 *     summary: consulting 추가 api
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first:
 *                 type: string
 *               second:
 *                 type: string
 *               third:
 *                 type: string
 *               fourth:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               customer_phoneNumber:
 *                 type: string
 *               company_idx:
 *                 type: int
 *             example:
 *               first: "token"
 *               second: "token"
 *               third: "token"
 *               fourth: "token"
 *               customer_name: "김기태"
 *               customer_phoneNumber: "010-6719-6919"
 *               company_idx: 1
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
