const schedule = require('node-schedule')
const db = require('../model/db')
const _f = require('../lib/functions')

const run = () => {
  schedule.scheduleJob("*/5 * * * * *", async () => {
    console.log("5초마다 세션 체크");
    let result = await db.sequelize.query(`select * from sessions`).spread((r)=>{
        return _f.makeSpreadArray(r);
    })
    if(result.length > 0){
        console.log(result)
        //SELECT * FROM stkypic.sessions where data like '%"user_idx":0%' <-- 중복 세션, 특정인 찾을 때 query
    }
    

  });
};

module.exports = {
  run: run,
};
