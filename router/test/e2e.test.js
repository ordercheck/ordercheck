const request = require("supertest");
const db = require("../../model/db");
const app = require("../../app");
const { cancelSchedule } = require("../../lib/payFunction");

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
    const response = request(app).post("/api/login").send({
      user_phone: "010-6719-6919",
      user_password: "rlxo12345",
    });
    console.log(response);
    expect(response.body.success).toBe(200);
  });
});

afterAll(async () => {
  await db.sequelize.sync({ force: true });
});
