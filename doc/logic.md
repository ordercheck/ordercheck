# Logic

## 어드민 유저 회원가입

1. POST /api/create/token 전화번호 회원가입 1단계 토큰 생성
2. POST /api/join/check 전화번호 회원가입 2단계 SNS체크
3. POST /api/mypage/customer/join/do 회원가입

- /api/mypage/customer/join/do Logic

  일반적인 회원가입

  1. Front에서 전달받은 token으로 user data를 확인.
  2. joinFunction 함수를 이용해 personal_code, last_login, 비밀번호 암호화 후 유저 생성.
  3. master template, team template, random company 생성
  4. 회원가입 하고자 하는 user를 생성한 random company의 소속으로 만듬.
  5. 만들어 놓은 random company를 무료 플랜으로 등록.

  팀원 초대를 받아서 회원가입

  1. 일반적인 회원가입 후 초대한 회사의 팀원 템플릿 idx를 찾고 초대한 회사에 가입 신청을 한다.

## 어드민 유저 로그인

1. POST /api/login 로그인

일반적인 로그인

1. Front에서 전달받은 token으로 user data를 확인.
2. 유효성 체크 후

플랜변경

1. planIdx를 db에서 찾아 변경하고자 하는 플랜 정보를 찾는다.
2. 현재 플랜 찾는다, 결제 예정 플랜 찾는다.
3. 견제 예정 플랜이 있으면 expire 날짜를 재설정해준다. (달 -> 연으로 변경할 경우 start는 같지만 expire가 변경되기 때문)
   프리에서 요금제 가입할 경우
4. 무료체험 사용중이면 현재 플랜과 결제 예정 플랜이 함께 변경되야한다.
5. 무료체험 사용을 끝냈다면 결제 예정 플랜만 변경되야한다.
