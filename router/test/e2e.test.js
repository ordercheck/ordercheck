const request = require("supertest");
const db = require("../../model/db");
const app = require("../../app");
const { cancelSchedule, delCardPort } = require("../../lib/payFunction");

if (process.env.NODE_MODE == "TESTING") {
  beforeAll(async () => {
    await db.sequelize.sync();
  });

  describe("무료 플랜으로 회원가입", () => {
    let token;
    it("유저 토큰 생성", async () => {
      const response = await request(app).post("/api/create/token").send({
        user_phone: "010-6719-6919",
        user_password: "rlxo12345",
        user_email: "rlxo6919@naver.com",
        user_name: "김기태",
      });

      expect(response.body).toHaveProperty("token");
      token = response.body.token;
    });

    it("토큰으로 유저 회원가입", async () => {
      const response = await request(app).post("/api/join/do").send({
        token,
        use_agree: true,
        private_agree: true,
        marketing_agree: true,
      });
      expect(response.statusCode).toBe(200);
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
        start_plan: "2022.06.01",
        expire_plan: "2022.06.01",
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
        company_subdomain: "테스트 서브",
      });

      expect(response.body.success).toBe(200);
    });
  });
  let loginToken;
  describe("신청폼", () => {
    it("로그인", async () => {
      const response = await request(app).post("/api/login").send({
        user_phone: "010-6719-6919",
        user_password: "rlxo12345",
      });

      expect(response.body).toHaveProperty("loginToken");
      loginToken = response.body.loginToken;
    });

    it("간편 신청폼 생성 type 1", async () => {
      const response = await request(app)
        .post("/api/form/link")
        .set("Authorization", `Bearer ${loginToken}`)
        .send({
          title: "제목",
          tempType: 1,
        });
      expect(response.body.formId).toBe(1);
    });

    it("상세 신청폼 생성 type 2", async () => {
      const response = await request(app)
        .post("/api/form/link")
        .set("Authorization", `Bearer ${loginToken}`)
        .send({
          title: "제목",
          tempType: 2,
        });
      expect(response.body.formId).toBe(2);
    });

    it("신청폼 복사", async () => {
      const response = await request(app)
        .post("/api/form/link/duplicate/1")
        .set("Authorization", `Bearer ${loginToken}`);
      expect(response.body.duplicateResult.formId).toBe(3);
    });

    it("생성한 신청폼 보여주기", async () => {
      const response = await request(app)
        .get("/api/form/link/list")
        .set("Authorization", `Bearer ${loginToken}`);

      expect(typeof response.body.formList).toBe("object");
    });

    it("신청폼 삭제", async () => {
      const response = await request(app)
        .delete("/api/form/link/3")
        .set("Authorization", `Bearer ${loginToken}`);
      expect(response.body.message).toBe("삭제 성공");
    });

    it("신청폼 제목 변경", async () => {
      const response = await request(app)
        .patch("/api/form/link/update")
        .set("Authorization", `Bearer ${loginToken}`)
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
        .set("Authorization", `Bearer ${loginToken}`);
      expect(response.body.success).toBe(200);
    });
  });
  describe("유저", () => {
    it("유저 프로필 불러오기", async () => {
      const response = await request(app)
        .get("/api/info/user")
        .set("Authorization", `Bearer ${loginToken}`);

      expect(response.body.success).toBe(200);
    });
  });

  afterAll(async () => {
    const card = await db.card.findByPk(1);
    const plan = await db.plan.findByPk(1);

    await cancelSchedule(card.customer_uid, plan.merchant_uid);
    await delCardPort(card.customer_uid);
    await db.sequelize.sync({ force: true });
  });
}
