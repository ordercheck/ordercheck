const express = require("express");
const router = express.Router();
const db = require("../../model/db");
const _f = require("../../lib/functions");
const user_session_check = (req, res, next) => {
    next();
};
const FileUpload = require("../../lib/aws/fileupload.js");
const multiparty = require("multiparty");
const axios = require('axios');
const aws = require('../../lib/aws/aws')
const request = require('request');
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotalySecretKey");
const jusoKey = "devU01TX0FVVEgyMDIxMDUwNjE1Mjg1MzExMTEzNDQ="
const jwt = require('jsonwebtoken');
const db_config = require("../../lib/config/db_config");

const { Expo } = require("expo-server-sdk");
const { makeArray, makeSpreadArray, randomString4 } = require("../../lib/functions");
const { licenses } = require("../../model/db");
const expo = new Expo();

const errorCatch = (logic) => {
    
}

let global_uidx = 0;

const check_data = (req,res,next) => {
    //////console.log(req.path)
    //////console.log(req.body.params)
    req.body = req.body.params
    next()

}
router.get("/", async (req, res, next) => {

    let path = req.path
    let url = req.url;
    let host = req.hostname

    let data = await db.sequelize.query(`SELECT * FROM totalcases where active = 1 order by idx desc limit 4`).spread((r)=>{
        return makeSpreadArray(r)
    })
    let banner = await db.sequelize.query(`SELECT * FROM banners where active = 1 and type = 0 order by banners.order`).spread((r)=>{
        return makeSpreadArray(r)
    })

    let cidx = 1
    let company_data = await db.companies.findAll({where:{idx:cidx}}).then((r)=>{
        return makeArray(r)[0]
    })
    let flag = 'index'
    console.log(company_data)
    // res.render("pc/index",{data,flag,banner})
    res.render("client/type01/normal/index",{data,flag,banner,company_data})
});

router.get("/planner", async (req, res, next) => {
    let flag = 'planner'
    res.render("pc/plannerservice",{flag})
});

router.get("/eventlist", async (req, res, next) => {
    
    let flag = 'event'
    let active = req.query.active == undefined ? 1 : 0 
    // let data = await db.events.findAll({where:{active}}).then((r)=>{
    //     return makeArray(r)
    // })
    let data;
    if(active == 1){
        data = await db.sequelize.query(`SELECT * FROM byjieun_home.events where date(end) > now() and active = 1`).spread((r)=>{
            return makeSpreadArray(r)
        })
    }else{
        data = await db.sequelize.query(`SELECT * FROM byjieun_home.events where date(end) < now() or active = 0`).spread((r)=>{
            return makeSpreadArray(r)
        })
    }

    res.render("pc/eventlist",{data,active,flag})
});

router.get("/event/detail", async (req, res, next) => {
    console.log("asdfasd")
    let flag = 'event'
    const {code,active} = req.query;
    console.log(code)
    let data = await db.events.findAll({where:{code}}).then((r)=>{
        return makeArray(r)[0]
    })
    res.render("pc/eventDetail",{data,active,flag})

});

router.get("/faq", async (req, res, next) => {
    let flag = 'faq';
    res.render("pc/faq",{flag})
});

router.get("/faq_planner", async (req, res, next) => {
    let flag = 'faq';
    res.render("pc/faq_planner",{flag})
});

router.get("/faq_notice", async (req, res, next) => {
    let flag = 'faq';
    res.render("pc/faq_notice",{flag})
});

router.get("/faq_refund", async (req, res, next) => {
    let flag = 'faq';
    res.render("pc/faq_refund",{flag})
});

router.get("/brand", async (req, res, next) => {
    res.render("pc/brand")
});

router.get("/story", async (req, res, next) => {
    res.render("pc/story/story00")
});

router.get("/story/01", async (req, res, next) => {
    res.render("pc/story/story01")
});

router.get("/story/02", async (req, res, next) => {
    res.render("pc/story/story02")
});

router.get("/story/03", async (req, res, next) => {
    res.render("pc/story/story03")
});

router.get("/story/04", async (req, res, next) => {
    res.render("pc/story/story04")
});

router.get("/story/05", async (req, res, next) => {
    res.render("pc/story/story05")
});

router.get("/story/06", async (req, res, next) => {
    res.render("pc/story/story06")
});

router.get("/story/07", async (req, res, next) => {
    res.render("pc/story/story07")
});

router.get("/story/08", async (req, res, next) => {
    res.render("pc/story/story08")
});


router.get("/totalcase", async (req, res, next) => {
    let cidx = 1
    let company_data = await db.companies.findAll({where:{idx:cidx}}).then((r)=>{
        return makeArray(r)[0]
    })
    let flag = 'totalcase';
    let category = req.query.category == undefined ? '전체' : req.query.category;
    let data;
    if(category == '전체'){
        data = await db.totalcases.findAll({where:{active:1}}).then((r)=>{
            return makeArray(r)
        })
    }else{
        data = await db.sequelize.query(`select * from totalcases where active = 1 and category like '%${category}%'`).spread((r)=>{
            return makeSpreadArray(r)
        })
    }
    res.render("client/type01/pc/totalcase",{company_data,data,category,flag})
});

router.get("/totalcase/view", async (req, res, next) => {
    let cidx = 1
    let company_data = await db.companies.findAll({where:{idx:cidx}}).then((r)=>{
        return makeArray(r)[0]
    })
    let flag = 'totalcase';
    let {idx} = req.query;
    let data = await db.totalcases.findAll({where:{idx}}).then((r)=>{
        return makeArray(r)[0]
    })
    let update_view = Number(data.view + 1)
    await db.totalcases.update({view:update_view},{where:{idx}})
    res.render("client/type01/pc/totalcase-view2",{company_data,data,flag})
});
router.get("/m/totalcase/view", async (req, res, next) => {
    let cidx = 1
    let company_data = await db.companies.findAll({where:{idx:cidx}}).then((r)=>{
        return makeArray(r)[0]
    })
    let flag = 'totalcase';
    let {idx} = req.query;
    let data = await db.totalcases.findAll({where:{idx}}).then((r)=>{
        return makeArray(r)[0]
    })
    let update_view = Number(data.view + 1)
    await db.totalcases.update({view:update_view},{where:{idx}})
    res.render("client/type01/m/totalcase-view2",{company_data,data,flag})
});

router.get("/totalcase/view2", async (req, res, next) => {
    let flag = 'totalcase';
    res.render("client/type01/pc/totalcase-view2",{flag})
});
router.get("/m/totalcase/view2", async (req, res, next) => {
    let flag = 'totalcase';
    res.render("client/type01/m/totalcase-view2",{flag})
});

router.get("/02", async (req, res, next) => {
    res.redirect("/planner")
});
router.get("/03", async (req, res, next) => {
    res.render("pc/survey/03")
});
router.get("/04", async (req, res, next) => {
    res.render("pc/survey/04")
});
router.get("/05", async (req, res, next) => {
    res.render("pc/survey/05")
});
router.get("/06", async (req, res, next) => {
    res.render("pc/survey/06")
});
router.get("/07", async (req, res, next) => {
    res.render("pc/survey/07")
});
router.get("/08", async (req, res, next) => {
    res.render("pc/survey/08")
});
router.get("/09", async (req, res, next) => {
    res.render("pc/survey/09")
});
router.get("/10", async (req, res, next) => {
    res.render("pc/survey/10")
});
router.get("/11", async (req, res, next) => {
    res.render("pc/survey/11")
});


router.get("/usage", async (req, res, next) => {
    res.render("pc/usage")
});

router.get("/privacy", async (req, res, next) => {
    res.render("pc/privacy")
});

router.get("/refund", async (req, res, next) => {
    res.render("pc/refund")
});

router.get("/cowork", async (req, res, next) => {
    res.render("pc/cowork")
});

router.get("/enterRequest", async (req, res, next) => {
    res.render("pc/enterRequest")
});



module.exports = router;