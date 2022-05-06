const request = require("supertest");
const db = require("../../model/db");
const app = require("../../app");

describe("POST api/create/token", () => {
  it("유저 토큰 생성", async () => {
    request(app)
      .post("/api/create/token")
      .send({
        user_phone: "010-6719-6919",
        user_password: "rlxo12345",
        user_email: "rlxo6919@naver.com",
        user_name: "김기태",
      })
      .expect(200);
  });
});
