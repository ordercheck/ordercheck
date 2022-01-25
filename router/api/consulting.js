const express = require('express');
const router = express.Router();
const {
  multer_calculate_upload,
  multer_form2_upload,
} = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');
const {
  dateFilter,
  statusFilter,
  contractPossibilityFilter,
} = require('../../controller/consultingFilter');
const {
  showTotalConsultingDefault,
  showCustomers,
  showDetailConsulting,
  showCompanyMembers,
  showIntegratedUser,
  showCalculate,
  showFilterResult,
} = require('../../controller/consultingShow');
const {
  addConsultingForm,
  setConsultingContactMember,
  delConsulting,
  addCompanyCustomer,
  patchConsultingStatus,
  addCalculate,
  downCalculate,
  doIntegratedUser,
  createFromLink,
} = require('../../controller/consultingStatus');
// *****************************filter*********************************
// date필터링
router.get('/date/:user_idx/:date', loginCheck, dateFilter);
// 상담 상태 필터링
router.get('/active/:user_idx/:active', loginCheck, statusFilter);
// 계약 가능성 필터링
router.get(
  '/contract-possibility/:user_idx/:contract_possibility',
  loginCheck,
  contractPossibilityFilter
);
// *****************************show*********************************
// 고객 연동하기에서 고객들을 보여주기
router.post('/integrated/user', loginCheck, showIntegratedUser);
router.patch('/integrated/user', loginCheck, doIntegratedUser);
// formlink 만들기
router.post('/create/form-link', loginCheck, createFromLink);

// 해당 상담 견적서 보여주기
router.get('/calculate/:customer_idx', loginCheck, showCalculate);

// 회사별 팀원 리스트 보기
router.get('/member/:company_idx', loginCheck, showCompanyMembers);

// 컨설팅 상세정보
router.get('/detail/:customer_idx', loginCheck, showDetailConsulting);

// 회사별 전체 상담내용 리스트(default)
router.get(
  '/customer/list/:limit/:page',
  loginCheck,
  showTotalConsultingDefault
);

// 해당 회사 고객정보 보여주기
// router.get('/customer/:form_link', loginCheck, showCustomers);

// filter결과 보여주기
router.get('/filter', loginCheck, showFilterResult);

// *****************************changeStatus*********************************
// 컨설팅 상태 수정 및 메모
router.patch('/status', loginCheck, patchConsultingStatus);
// 견적서 등록
router.post(
  '/calculate',
  loginCheck,
  multer_calculate_upload().single('img'),
  addCalculate
);

// 컨설팅 담당자 설정하기
router.post('/member/set', loginCheck, setConsultingContactMember);

// 견적서 다운로드
router.post('/calculate/down', loginCheck, downCalculate);
// 상담폼 추가 라우터
router.post(
  '/',
  multer_form2_upload().fields([{ name: 'img' }, { name: 'concept' }]),
  addConsultingForm
);
// 고객등록 api
router.post('/customer', loginCheck, addCompanyCustomer);
// 컨설팅 삭제
router.delete('/', loginCheck, delConsulting);

module.exports = router;
