const request = require("supertest");
const db = require("../../model/db");
const app = require("../../app");
const { cancelSchedule, delCardPort } = require("../../lib/payFunction");

if (process.env.NODE_MODE == "TESTING") {
  beforeAll(async () => {
    await db.sequelize.sync();
  });

  describe("무료 플랜으로 회원가입", () => {
    let huidxToken;
    let member1Token;
    it("유저 토큰 생성", async () => {
      const huidxResponse = await request(app).post("/api/create/token").send({
        user_phone: "010-6719-6919",
        user_password: "rlxo12345",
        user_email: "rlxo6919@naver.com",
        user_name: "김기태",
      });

      const member1Response = await request(app)
        .post("/api/create/token")
        .send({
          user_phone: "010-1111-1111",
          user_password: "rlxo12345",
          user_email: "rlxo6919@naver.com",
          user_name: "김멤버",
        });

      expect(member1Response.body).toHaveProperty("token");
      expect(huidxResponse.body).toHaveProperty("token");
      huidxToken = huidxResponse.body.token;
      member1Token = member1Response.body.token;
    });

    it("토큰으로 유저 회원가입", async () => {
      const huidxResponse = await request(app).post("/api/join/do").send({
        token: huidxToken,
        use_agree: true,
        private_agree: true,
        marketing_agree: true,
      });
      const member1Response = await request(app).post("/api/join/do").send({
        token: member1Token,
        use_agree: true,
        private_agree: true,
        marketing_agree: true,
      });
      expect(member1Response.statusCode).toBe(200);
      expect(huidxResponse.statusCode).toBe(200);
    });
  });

  describe("회원가입 후 플랜 가입", () => {
    let ut;
    let pt;
    let ct;
    it("유저 토큰 생성", async () => {
      const response = await request(app).post("/api/create/token").send({
        user_phone: "010-6719-6919",
        user_password: "rlxo12345",
        user_email: "rlxo6919@naver.com",
        user_name: "김기태",
      });

      expect(response.body).toHaveProperty("token");

      ut = response.body.token;
    });

    it("플랜 토큰 만들기", async () => {
      const response = await request(app).post("/api/create/token/data").send({
        plan: "컴퍼니",
        free_plan: "2022.06.01",
        start_plan: "2022.06.02",
        expire_plan: "2022.06.03",
        result_price: 1000,
        result_price_levy: 1010,
        plan_price: 1000,
        whiteLabelChecked: false,
        chatChecked: true,
        analysticChecked: true,
        whiteLabel_price: 1000,
        chat_price: 1000,
        analystic_price: 1000,
        pay_type: "month",
      });

      expect(response.body).toHaveProperty("token");
      pt = response.body.token;
    });

    it("카드 등록 및 토큰 만들기", async () => {
      const response = await request(app).post("/api/create/token/data").send({
        card_number: "6573114500510154",
        expiry: "2024-12",
        pwd_2digit: "33",
        birth: "961005",
        card_email: "rlxo6919@naver.com",
      });
      expect(response.body).toHaveProperty("token");
      ct = response.body.token;
    });

    it("회원가입 및 플랜 등록", async () => {
      const response = await request(app).post("/api/company/check").send({
        ut,
        ct,
        pt,
        company_name: "테스트 회사",
        company_subdomain: "testSub",
      });

      expect(response.body.success).toBe(200);
    });
  });
  let huidxLoginToken;
  let member1LoginToken;
  describe("로그인", () => {
    it("소유주 로그인", async () => {
      const huidxResponse = await request(app).post("/api/login").send({
        user_phone: "010-6719-6919",
        user_password: "rlxo12345",
      });

      expect(huidxResponse.body).toHaveProperty("loginToken");
      huidxLoginToken = huidxResponse.body.loginToken;
    });

    it("팀원1 로그인", async () => {
      const member1Response = await request(app).post("/api/login").send({
        user_phone: "010-1111-1111",
        user_password: "rlxo12345",
      });
      expect(member1Response.body).toHaveProperty("loginToken");
      member1LoginToken = member1Response.body.loginToken;
    });
  });
  describe("유저", () => {
    it("유저 프로필 불러오기", async () => {
      const response = await request(app)
        .get("/api/info/user")
        .set("Authorization", `Bearer ${huidxLoginToken}`);

      expect(response.body.success).toBe(200);
    });

    it("유저 이름 변경", async () => {
      const response = await request(app)
        .patch("/api/info/user/")
        .send({
          user_name: "새로운 이름",
        })
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("유저 이메일 변경", async () => {
      const response = await request(app)
        .patch("/api/info/user/")
        .send({
          user_email: "새로운 이메일",
        })
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("유저 알람 설정 보여주기", async () => {
      const response = await request(app)
        .get("/api/info/user/alarm/config")
        .set("Authorization", `Bearer ${huidxLoginToken}`);

      expect(response.body.success).toBe(200);
    });

    it("유저 알람 설정 변경", async () => {
      const response = await request(app)
        .patch("/api/info/user/alarm/config/")
        .send({
          emailProductServiceAlarm: false,
        })
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });
  });

  describe("회사 가입", () => {
    it("회사 가입 대기자에 아무도 없을 때", async () => {
      const response = await request(app)
        .get("/api/invite/standby")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.standbyUser.length).toBe(0);
    });

    it("회사 가입 신청", async () => {
      const response = await request(app)
        .get("/api/info/user/join/company/testSub")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("회사 가입 대기자 있을 때", async () => {
      const response = await request(app)
        .get("/api/invite/standby")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.standbyUser.length).toBe(1);
    });

    it("회사 가입 대기자 거절", async () => {
      const response = await request(app)
        .get("/api/invite/refuse/4")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("회사 가입 거절 후 대기자에 아무도 없을 때", async () => {
      const response = await request(app)
        .get("/api/invite/standby")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.standbyUser.length).toBe(0);
    });

    it("회사 가입 거절 후 해당 회사에 다시 신청 했을 때", async () => {
      const response = await request(app)
        .post("/api/invite/rejoin")
        .send({
          company_subdomain: "testSub",
        })
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.success).toBe(200);
    });
    it("회사 가입 신청 후 같은 회사에 또 가입 신청 했을 때", async () => {
      const response = await request(app)
        .get("/api/info/user/join/company/testSub")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.success).toBe(400);
    });
    it("회사 가입 거절", async () => {
      const response = await request(app)
        .get("/api/invite/refuse/4")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("회사 가입 거절 후 회사 설정에서 회사 가입 신청 했을 때", async () => {
      const response = await request(app)
        .get("/api/info/user/join/company/testSub")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("회사 가입 신청 후 취소 했을 때", async () => {
      const response = await request(app)
        .post("/api/invite/join/cancel")
        .send({
          company_subdomain: "testSub",
        })
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("초대 링크 로그인으로 가입 신청 했을 때", async () => {
      const response = await request(app).post("/api/login").send({
        user_phone: "010-1111-1111",
        user_password: "rlxo12345",
        company_subdomain: "testSub",
      });
      expect(response.body.status).toBe("standBy");
    });

    it("회사 가입 신청 후 같은 회사에 또 가입 신청 했을 때", async () => {
      const response = await request(app)
        .get("/api/info/user/join/company/testSub")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.success).toBe(400);
    });

    it("회사 가입 거절", async () => {
      const response = await request(app)
        .get("/api/invite/refuse/6")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("가입 거절 당하고 다시 회사 링크로 로그인 할 때", async () => {
      const response = await request(app).post("/api/login").send({
        user_phone: "010-1111-1111",
        user_password: "rlxo12345",
        company_subdomain: "testSub",
      });
      expect(response.body.status).toBe("refused");
    });

    it("가입 거절 당하고 설정에서 가입 신청 할 때", async () => {
      const response = await request(app)
        .get("/api/info/user/join/company/testSub")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("가입 허가", async () => {
      const response = await request(app)
        .get("/api/invite/join/do/7")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("가입 허가 받고 다시 회사 링크로 로그인 할 때", async () => {
      const response = await request(app).post("/api/login").send({
        user_phone: "010-1111-1111",
        user_password: "rlxo12345",
        company_subdomain: "testSub",
      });
      expect(response.body.status).toBe("access");
    });
  });
  describe("신청폼", () => {
    it("간편 신청폼 생성 type 1", async () => {
      const response = await request(app)
        .post("/api/form/link")
        .set("Authorization", `Bearer ${huidxLoginToken}`)
        .send({
          title: "제목",
          tempType: 1,
        });
      expect(response.body.formId).toBe(1);
    });

    it("상세 신청폼 생성 type 2", async () => {
      const response = await request(app)
        .post("/api/form/link")
        .set("Authorization", `Bearer ${huidxLoginToken}`)
        .send({
          title: "제목",
          tempType: 2,
        });
      expect(response.body.formId).toBe(2);
    });
    it("열람 권한 없는 신청폼 못봄", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.formList.length).toBe(0);
    });

    it("열람 권한 있는 신청폼 볼 수 있음", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.formList.length).toBe(2);
    });

    it("열람 가능 멤버 추가", async () => {
      const response = await request(app)
        .patch("/api/config/company/form/set/member/1")
        .send({
          members: [1, 2],
        })
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("열람 가능 멤버로 추가된 뒤 해당 폼 볼수 있음", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.formList.length).toBe(1);
    });

    it("멤버 열람 권한 있는 신청폼 복사", async () => {
      const response = await request(app)
        .post("/api/form/link/duplicate/1")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.duplicateResult.formId).toBe(3);
    });

    it("멤버 열람 권한 없는 신청폼 복사", async () => {
      const response = await request(app)
        .post("/api/form/link/duplicate/2")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.duplicateResult.formId).toBe(4);
    });

    it("열람 가능 신청폼 복사한 것만 볼 수 있음", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.formList.length).toBe(2);
    });

    it("신청폼 삭제", async () => {
      const response = await request(app)
        .delete("/api/form/link/3")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.message).toBe("삭제 성공");
    });

    it("열람 가능 신청폼 삭제되면 해당 신청폼 못 봄", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.formList.length).toBe(1);
    });

    it("열람 가능 멤버 해제", async () => {
      const response = await request(app)
        .patch("/api/config/company/form/set/member/1")
        .send({
          members: [1],
        })
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });

    it("열람 가능 신청폼 권한 없으면 못봄", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${member1LoginToken}`);
      expect(response.body.formList.length).toBe(0);
    });

    it("소유주는 신청폼을 다 볼 수 있음", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.formList.length).toBe(3);
    });

    it("신청폼 제목 변경", async () => {
      const response = await request(app)
        .patch("/api/form/link/update")
        .set("Authorization", `Bearer ${huidxLoginToken}`)
        .send({
          formId: 2,
          title: "new title",
        });
      expect(response.body.formDetail.title).toBe("new title");
    });

    it("신청폼 form_link로 detail 보기", async () => {
      const findLinkResult = await db.formLink.findByPk(1);
      const response = await request(app)
        .get(`/api/form/link/info/${findLinkResult.form_link}`)
        .set("Authorization", `Bearer ${huidxLoginToken}`);
      expect(response.body.success).toBe(200);
    });
  });

  // describe("설정", () => {
  //   it("멤버 이름 바꾸기", async () => {
  //     const findLinkResult = await db.formLink.findByPk(1);
  //     const response = await request(app)
  //       .get(`/api/form/link/info/${findLinkResult.form_link}`)
  //       .set("Authorization", `Bearer ${huidxLoginToken}`);
  //     expect(response.body.success).toBe(200);
  //   });
  // });

  afterAll(async () => {
    const card = await db.card.findByPk(1);
    const plan = await db.plan.findByPk(2);
    await cancelSchedule(card.customer_uid, plan.merchant_uid);
    await delCardPort(card.customer_uid);
    // await db.sequelize.sync({ force: true });
  });
}
