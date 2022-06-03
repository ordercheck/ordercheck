# 로직

## 어드민 유저 회원가입

1. POST /api/create/token 전화번호 회원가입 1단계 토큰 생성
2. POST /api/join/check 전화번호 회원가입 2단계 SNS체크
3. POST /api/mypage/customer/join/do 회원가입

일반적인 회원가입

1. Front에서 전달받은 token으로 user data를 확인.
2. joinFunction 함수를 이용해 personal_code, last_login, 비밀번호 암호화 후 유저 생성.
3. 회사 템플릿 (master template, team template), random company 생성
4. 회원가입 하고자 하는 user를 생성한 random company의 소속으로 만듬.
5. 만들어 놓은 random company를 무료 플랜으로 등록.

팀원 초대를 받아서 회원가입

1. 일반적인 회원가입 후 초대한 회사의 팀원 템플릿 idx를 찾고 초대한 회사에 가입 신청.

## 유저 로그인

1. POST /api/login 로그인

일반적인 로그인

1. Front에서 전달받은 token으로 user data를 확인.
2. 유효성 체크 후 user_idx를 담은 jwt 토큰과 소속된 회사 도메인을 응답.

팀원 초대를 받아서 로그인

1. 초대 받은 유저가 가입되어 있는 곳이 해당 회사와 같다면 access 응답.
2. 초대 받은 유저가 가입되어 있는 곳이 해당 회사와 다르다면 already 응답.
3. 아무 회사에도 가입되어 있지 않다면 가입신청 하고 standBy 응답.

## 대표카드 변경

1. 해당 대표카드를 찾아서 main false로 대표카드 해제.
2. 변경하고자 하는 타겟 카드를 main true로 변경하여 대표카드 등록.
3. 기존 결제 스케줄 취소.
4. 새로운 카드로 새로운 결제 스케줄 등록.
5. 결제 예약 플랜 새로운 merchant_uid로 변경

## 플랜 변경

- 플랜 변경할 때 현재 유저가 무료체험 중인지, 연결제 => 월결제 또는 월결제 => 연결제인지, 무료 => 유료, 유료 => 무료인지, 등등 체크 해야함
- 아임포트도 함께 플랜에 따라 결제 예정 스케줄이 변경되는지 확인이 필요

# 데이터 베이스

## 테이블

- alarm : 알람
- calculate : 견적서
- card : 카드
- chatTemplate : 채팅 템플릿
- company : 회사
- config : 권한 템플릿
- consulting : 상담신청
- consultingTimeLine : 상담신청 타임라인
- customer : 고객
- customerAccount : 고객 계정
- customerFile : 고객 파일보관함
- delReason : 삭제 이유
- files : 파일
- folders : 폴더
- formLink : 폼 링크
- formOpenMember : 폼 열 수 있는 멤버
- pairPace : 페어피스
- plan : 회사가 사용중인 플랜 정보
- planInfo : 플랜 가격 부가서비스 등 정보
- receipt : 영수증
- sms : sms 문자 비용
- smsHistory : sms 보낸 이력
- store : 방문기록(브레드 컬럼)
- user : 회원가입 유저 계정
- userCompany : 유저의 회사 가입 여부

## 인스턴스

- ordercheck - 개발, 테스트 서버용 인스턴스
- ordercheckPro - 실서비스 인스턴스

# 서버

- 개발 서버 : http://54.180.101.221/
- 테스트 서버 : http://3.36.76.40/
- 배포 서버 : https://www.ordercheckprovide.com/

- auto scaling 설정 해놔서 템플릿 버전 관리 하면서 바꿔줘야함(트레픽이 많은 서비스는 아니라서 너무 높은 ec2사용 안해도 될듯)

## 배포 프로세스

개발 서버에서 개발 및 테스트 -> 테스트 서버에서 테스트 -> 배포 서버에 배포

## 결제

- 아임포트 정기결제(비인증 결제) 사용하여 플랜결제, 문자결제
- 문자결제 같은 경우는 등록되어 있는 카드로 바로 결제가 되야 하기 때문에 비인증 결제를 사용

## 알림톡 문자

- 알림톡, 문자 서비스는 네이버 클라우드 플랫폼 사용
- 알림톡 보내는것 실패했을 경우 문자로 보내는 기획이 몇몇 있음
- 알림톡 보내고 나서 성공여부 확인할 때 바로 확인하면 안되고 시간을 조금 주고나서 확인해야함 안그러면 네이버 api가 업데이트 되기 전
  호출해버려서 성공 여부가 나타나지 않음, (setTimeOut)
- 문자 보내고 금액 차감 같은 경우는 db를 수정 아임포트에서 현재 유저의 남은 돈은 계산 못함

## 이미지 업로드

- 썸네일이 필요한 이미지(프로필이미지)같은 경우
  원본 이미지 업로드 후 aws lambda를 사용하여 이미지 리사이징
- 이외 이미지는 그냥 aws 업로드

## 알람

- 알람 시스템은 socket.io를 사용
- 클라이언트가 접속하면 소켓에 연결되고 바로 소켓 알람 시스템(room에 들어감)
- 나중에 알람 기능이 있는데 이는 setTimeOut으로 구현
