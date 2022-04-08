/**
 * @swagger
 * /api/check/company/member/{company_subdomain}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - check
 *      summary: 회사 가입 등록되어 잇는지 체크
 *      parameters:
 *         - in: path
 *           name: company_subdomain
 *           schema:
 *             type: string
 *           example: "company_subdomain"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패


*/
