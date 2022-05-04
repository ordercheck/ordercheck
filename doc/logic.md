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
