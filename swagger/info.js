/**
 * @swagger
 * /api/info/user:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  profile
 *      summary: 유저 프로필 조회
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/config/company:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 정보 조회
 *      responses:
 *         '200':
 *            description: 성공
 *         '400':
 *           description: 실패
 * /api/config/company/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 정보 변경
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               company_subdomain:
 *                 type: string
 *               address:
 *                 type: string
 *               detail_address:
 *                 type: string
 *               business_number:
 *                 type: string
 *             example:
 *               company_name: "회사명"
 *               company_subdomain: "서브도메인"
 *               address: "주소"
 *               detail_address: "상세주소"
 *               business_number: "사업자 번호"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/logo:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 로고 등록 및 변경(form Data)
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *             example:
 *               img: "img"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/logo/:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 로고 삭제
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/enrollment:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 사업자 등록증 등록 및 변경(form Data)
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *             example:
 *               file: "file"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/member:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 같은 팀원 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/search/member/:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 같은 팀원 검색하기
 *      parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           example: "김기태"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/member/{memberId}:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 회사 팀원 삭제하기
 *      parameters:
 *         - in: path
 *           name: memberId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/template:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 권한 템플릿 가져오기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/template/:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 템플릿 등록하기
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *             example:
 *               title: '제목'
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/template/{templateId}/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 권한 템플릿 수정하기
 *      parameters:
 *         - in: path
 *           name: templateId
 *           schema:
 *             type: integer
 *           example: 1
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template_name:
 *                 type: string
 *               change_company_info:
 *                 type: boolean
 *               member_approval:
 *                 type: boolean
 *               member_del:
 *                 type: boolean
 *               member_detail_edit:
 *                 type: boolean
 *               member_invite:
 *                 type: boolean
 *               create_auth_template:
 *                 type: boolean
 *               edit_auth_template:
 *                 type: boolean
 *               del_auth_template:
 *                 type: boolean
 *               add_new_customer:
 *                 type: boolean
 *               customer_info_edit:
 *                 type: boolean
 *               integrate_customer:
 *                 type: boolean
 *               customer_del:
 *                 type: boolean
 *               calculate_upload_share:
 *                 type: boolean
 *               calculate_down:
 *                 type: boolean
 *               calculate_del:
 *                 type: boolean
 *               file_upload:
 *                 type: boolean
 *               file_down:
 *                 type: boolean
 *               file_del:
 *                 type: boolean
 *               create_form:
 *                 type: boolean
 *               edit_form:
 *                 type: boolean
 *               del_form:
 *                 type: boolean
 *               change_auth_open:
 *                 type: boolean
 *               change_whilte_label:
 *                 type: boolean
 *               send_message:
 *                 type: boolean
 *               create_chat_room:
 *                 type: boolean
 *               del_chat_room:
 *                 type: boolean
 *               set_comment_template:
 *                 type: boolean
 *               set_chat:
 *                 type: boolean
 *               stat_access:
 *                 type: boolean
 *             example:
 *               company_total: "회사정보"
 *               member_total: "팀원관리"
 *               member_invite_total: "팀원 초대"
 *               auth_total: "권한 관리"
 *               customer_total: "고객 관리"
 *               calculate_total: "견적 관리"
 *               file_total: "파일보관함"
 *               form_total: "상담 신청폼"
 *               chat_total: "채팅"
 *               analytics_total: "통계분석"
 *               template_name: "템플릿 이름"
 *               change_company_info: "회사정보편집"
 *               member_approval: "팀원승인"
 *               member_del: "팀원 삭제"
 *               member_detail_edit: "팀원 상세 편집"
 *               member_invite: "SMS/이메일로 초대"
 *               create_auth_template: "템플릿 생성"
 *               edit_auth_template: "템플릿 수정"
 *               del_auth_template: "템플릿 삭제"
 *               add_new_customer: "신규 고객 등록"
 *               customer_info_edit: "기본정보 수정"
 *               integrate_customer: "고객 연동"
 *               customer_del: "고객 삭제"
 *               calculate_upload_share: "견적 업로드 및 공유"
 *               calculate_down: "견적 다운로드"
 *               calculate_del: "견적 삭제"
 *               file_upload: "파일 업로드"
 *               file_down: "파일 다운로드"
 *               file_del: "파일 삭제"
 *               create_form: "신청폼 생성"
 *               edit_form: "신청폼 수정"
 *               del_form: "신청폼 삭제"
 *               change_auth_open: "열람 권한 변경"
 *               change_whilte_label: "화이트 라벨링 변경"
 *               send_message: "메세지 보내기"
 *               create_chat_room: "채팅방 생성"
 *               del_chat_room: "채팅방 삭제"
 *               set_comment_template: "자주 쓰는 답변 템플릿 설정"
 *               set_chat: "채팅 운영 및 안내 설정"
 *               stat_access: "접근 가능"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/template/{templateId}:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 권한 템플릿 삭제하기
 *      parameters:
 *         - in: path
 *           name: templateId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/plan:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 구독관리 플랜정보 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/plan/history:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 구독관리 구독 내역 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/plan/detail/{planId}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 플랜 detail 보여주기
 *      parameters:
 *         - in: path
 *           name: planId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/sms:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 문자 비용 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/sms/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 자동 문자 요금 충전 설정 변경
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               repay:
 *                 type: boolean
 *               auto_min:
 *                 type: string
 *               auto_price:
 *                 type: string
 *             example:
 *               repay: true
 *               auto_min: "3,000"
 *               auto_price: "7,000"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/sms/pay:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 바로 문자충전
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text_cost:
 *                 type: string
 *             example:
 *               text_cost: "1,5000"
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/sms/history:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 문자 전송 내역 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/card:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 등록한 카드들 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/card/detail/{cardId}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 카드정보 상세 보여주기
 *      parameters:
 *         - in: path
 *           name: cardId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/card/{cardId}/:
 *   delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 카드 삭제하기
 *      parameters:
 *         - in: path
 *           name: cardId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/template/detail/{templateId}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 템플릿  detail 가져오기
 *      parameters:
 *         - in: path
 *           name: templateId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/card/set/main/{cardId}:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 메인카드로 변경하기
 *      parameters:
 *         - in: path
 *           name: cardId
 *           schema:
 *             type: integer
 *           example: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/card/receipt/list/{category}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 영수증 리스트 보여주기 (전체 :0, 구독:1, 자동 문자 충전:2)
 *      parameters:
 *         - in: path
 *           name: category
 *           schema:
 *             type: integer
 *           example: 0
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/card/receipt/detail/{receiptId}:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 영수증 detail 보여주기
 *      parameters:
 *         - in: path
 *           name: receiptId
 *           schema:
 *             type: integer
 *           example: 123123
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/form/list:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: form List 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/form/set/member/{formId}:
 *   post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: form 열람 가능 인원 설정
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               members:
 *                 type: array
 *             example:
 *               members: [1,2,3,4]
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/chat/template:
 *   get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 채팅 템플릿 보여주기
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/member/{memberId}/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 멤버 정보 변경하기
 *      parameters:
 *         - in: path
 *           name: memberId
 *           schema:
 *             type: integer
 *           example: 1
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *               user_email:
 *                 type: string
 *               templateId:
 *                 type: integer
 *             example:
 *               user_name: '김철수'
 *               user_email: "김철수@naver.com"
 *               templateId: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패
 * /api/config/company/card/email/{cardId}/:
 *   patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *       -  config
 *      summary: 카드 이메일 변경하기 
 *      parameters:
 *         - in: path
 *           name: cardId
 *           schema:
 *             type: integer
 *           example: 1
 *      requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *               user_email:
 *                 type: string
 *               templateId:
 *                 type: integer
 *             example:
 *               user_name: '김철수'
 *               user_email: "김철수@naver.com"
 *               templateId: 1
 *      responses:
 *       '200':
 *         description: 성공
 *       '401':
 *         description: 실패

 */
