const express = require('express');
const router = express.Router();

const loginCheck = require('../../middleware/auth');
const {
  dateFilter,
  statusFilter,
  contractPossibilityFilter,
} = require('../../controller/consultingFilter');
const {
  showTotalConsultingDefault,
  showCompanyCustomers,
  showDetailConsulting,
  showCompanyMembers,
  showDetailTimeLine,
  showCalculate,
} = require('../../controller/consultingShow');
const {
  addConsultingForm,
  setConsultingContactMember,
  delConsulting,
  addCompanyCustomer,
  patchConsultingStatus,
  addCalculate,
} = require('../../controller/consultingStatus');
const { Op } = require('sequelize');

// date필터링
router.get('/date/:company_idx/:date', loginCheck, dateFilter);
// 상담 상태 필터링
router.get('/active/:company_idx/:active', loginCheck, statusFilter);
// 계약 가능성 필터링
router.get(
  '/contract-possibility/:company_idx/:contract_possibility',
  loginCheck,
  contractPossibilityFilter
);
// 해당 상담 타임라인 보여주기
router.get(
  '/time/:company_idx/:consulting_idx',
  loginCheck,
  showDetailTimeLine
);

// 해당 상담 견적서 보여주기
router.get(
  '/calculate/:company_idx/:consulting_idx',
  loginCheck,
  showCalculate
);

// 회사별 전체 상담내용 리스트(default)
router.get(
  '/:company_idx/:limit/:page',
  loginCheck,
  showTotalConsultingDefault
);
// 회사별 팀원 리스트 보기
router.get('/member/:company_idx', loginCheck, showCompanyMembers);
// 컨설팅 담당자 설정하기
router.post('/member/set', loginCheck, setConsultingContactMember);

// 컨설팅 상세정보
router.get('/detail/:idx', loginCheck, showDetailConsulting);

// 해당 회사 고객정보 보여주기
router.get('/customer/:company_idx', loginCheck, showCompanyCustomers);

// 컨설팅 상태 수정 및 메모
router.patch('/status', loginCheck, patchConsultingStatus);
// 견적서 등록
router.post('/calculate', loginCheck, addCalculate);
// 상담폼 추가 라우터
router.post('/', addConsultingForm);
// 고객등록 api
router.post('/customer', loginCheck, addCompanyCustomer);
// 컨설팅 삭제
router.delete('/', loginCheck, delConsulting);

module.exports = router;
