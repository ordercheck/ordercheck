/**
 * @swagger
 * /api/card:
 *   post:
 *      tags:
 *       - card
 *      summary: 카드등록하기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               card_number:
 *                 type: string
 *               expiry:
 *                 type: string
 *               pwd_2digit:
 *                 type: string
 *               birth:
 *                 type: string
 *               card_email:
 *                 type: string
 *             example:
 *               card_number: "5387208246852660"
 *               expiry: "2026-05"
 *               pwd_2digit: "49"
 *               birth: "961005"
 *               card_email: "rlxo6919@naver.com"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
