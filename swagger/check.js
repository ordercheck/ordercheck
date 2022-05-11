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
 * /api/check/company/subdomain:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       - check
 *      summary: 회사 서브 도메인 가져오기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/check/plan:
 *   get:
 *     tags:
 *       - check
 *     summary: planInfo 불러오기
 *     responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 */
