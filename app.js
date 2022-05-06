"use strict";
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const session = require("express-session");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/config");
const json2xls = require("json2xls");
const compression = require("compression");

// const corsOptions = {
//   origin: 'https://ordercheck-file.s3.ap-northeast-2.amazonaws.com',
//   credentials: true,
// };

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 100,
//   message: "Too many request from this IP",
// });

const allowedOrigins = [
  "https://ordercheck-file.s3.ap-northeast-2.amazonaws.com",
];
require("dotenv").config();
const db_config = require("./lib/config/db_config");
// const redis = require("redis");
// const RedisStore = require("connect-redis")(session);
// const redisClient = redis.createClient();
// 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
// ssh -i /Users/kimgunhee/Desktop/keys/ordercheck.pem ubuntu@3.37.20.22
var MySQLStore = require("express-mysql-session")(session);
var options = db_config;
//세션 생성에 limit이 생기거나 한계가 있으면 sequelize pool limit을 확인!
const sessionStore = new MySQLStore(options);
const sess = {
  resave: false,
  saveUninitialized: false,
  secret: "sessionscrete",
  name: "sessionId",
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: sessionStore,
  schema: {
    columnNames: {
      session_id: "custom_session_id",
      expires: "custom_expires_column_name",
      data: "custom_data_column_name",
    },
  },
};

//client
// const adminRouter = require('./router/admin/indexRouter')
// const clientRouter = require('./router/client/indexRouter')
const ordercheckRouter = require("./router/ordercheck/indexRouter");

const apiRouter = require("./router/api/user");
const consultingRouter = require("./router/api/consulting");
const inviteRouter = require("./router/api/invite");
const configRouter = require("./router/api/config");
const alarmRouter = require("./router/api/alarm");
const infoRouter = require("./router/api/info");
const schedulePayRouter = require("./router/api/schedulePay");
const cardRouter = require("./router/api/card");
const myPageRouter = require("./router/api/mypage");
const adminRouter = require("./router/api/admin");
const totalRouter = require("./router/api/total");
const formLinkRouter = require("./router/api/formLink");
const fileRouter = require("./router/api/fileStore");
const checkRouter = require("./router/api/check");
const homeRouter = require("./router/api/home");
const storeRouter = require("./router/api/store");
const socketRouter = require("./router/api/socket");
const s3ControllRouter = require("./router/api/s3");
const pairpaceRouter = require("./router/api/pairpace");

const db = require("./model/db");

class AppServer extends http.Server {
  constructor(config) {
    const app = express();
    super(app);
    this.config = config;
    this.app = app;
    this.currentConns = new Set();
    this.busy = new WeakSet();
    this.stop = false;
    process.env.NODE_ENV =
      process.env.NODE_ENV &&
      process.env.NODE_ENV.trim().toLowerCase() == "production"
        ? "production"
        : "development";
  }
  start() {
    this.set();
    this.middleWare();
    this.router();
    this.dbConnection();
    this.schedule();

    // let testMail = {
    //     receiver: ['gunhee21@gmail.com'],
    //     subject: '클래스형 노드서버가 켜짐',
    //     content:'<h1>서버 안전운행중 - 이상무</h1>'
    // }
    // testMailer(testMail)
    return this;
  }

  set() {
    this.app.engine("ejs", require("ejs").renderFile);
    this.app.set("views", __dirname + "/views");
    this.app.set("view engine", "ejs");
  }

  middleWare() {
    this.app.enable("trust proxy");
    this.app.use(compression());
    this.app.use(helmet());

    this.app.use(cors());

    this.app.use(function (req, res, next) {
      var origin = req.headers.origin;
      if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      // res.header('Access-Control-Allow-Origin', '*');
      res.header("Access-Control-Allow-Methods", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", true);
      return next();
    });
    this.app.use(
      express.json({
        limit: "100mb",
      })
    );
    this.app.use(
      express.urlencoded({
        limit: "100mb",
        extended: true,
      })
    );
    // this.app.use(bodyParser())
    this.app.use(cookieParser());
    this.app.use("/public", express.static(__dirname + "/public"));
    this.app.use(session(sess));
    this.app.use(json2xls.middleware);

    this.app.use(async (req, res, next) => {
      var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      // console.log("IP::" + ip)
      next();

      // console.log("ENV::"+process.env.NODE_ENV)
      // console.log("URL::"+req.url)
      // await db.views.create({ip,path:req.url})
      // if (process.env.NODE_ENV == 'development') {
      //     next()
      // } else {
      //     let protocol = req.headers['x-forwarded-proto'] || req.protocol;
      //     if (protocol == 'https') {
      //         let from = `${protocol}://${req.hostname}${req.url}`;
      //         console.log(from)
      //         next();
      //     } else {
      //         let from = `${protocol}://${req.hostname}${req.url}`;
      //         let to = `https://www.ordercheck.io`;
      //         // log and redirect
      //         console.log(`[${req.method}]: ${from} -> ${to}`);
      //         res.redirect(to);
      //     }
      // }
    });
  }

  router() {
    // this.app.use(limiter);
    this.app.use(morgan("tiny"));
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.use("/", ordercheckRouter);
    this.app.use("/api", apiRouter);
    this.app.use("/api/consulting", consultingRouter);
    this.app.use("/api/form/link", formLinkRouter);
    this.app.use("/api/config", configRouter);
    this.app.use("/api/total", totalRouter);
    this.app.use("/api/alarm", alarmRouter);
    this.app.use("/api/info", infoRouter);
    this.app.use("/api/home", homeRouter);
    this.app.use("/api/admin", adminRouter);
    this.app.use("/api/mypage", myPageRouter);
    this.app.use("/api/store", storeRouter);
    this.app.use("/api/check", checkRouter);
    this.app.use("/api/schedule/pay", schedulePayRouter);
    this.app.use("/s3", s3ControllRouter);
    this.app.use("/api/invite", inviteRouter);
    this.app.use("/api/card", cardRouter);
    this.app.use("/api/file/store", fileRouter);
    this.app.use("/api/socket", socketRouter);
    this.app.use("/api/pairpace", pairpaceRouter);

    // 에러처리
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      db.err.create({ err: err.stack });
      return res.send({ success: 500, message: err.message });
    });
  }
  dbConnection() {
    console.log("Eviroment ::: " + process.env.NODE_ENV);

    db.sequelize
      .sync({
        force: false,
      })
      .then(() => {
        console.log(
          "development: Connection has been established successfully."
        );
      })
      .then(() => {
        console.log("DB Sync complete.");
      })
      .catch((err) => {
        console.log("db에러");
        console.error("Unable to connect to the database:", err);
      });
  }

  schedule() {
    // sessionCheck.run()

    require("./lib/schedule");
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV == "development") {
      // pushNotify.run(3)
      // emailSend.run(3)
      // kakaoPush.run(5)
      // kakaoPush.run(5)
    } else {
      // pushNotify.run(3)
      // emailSend.run(3)
      // kakaoPush.run(5)
      // kakaoPush.run(5)
    }
  }
}

if (process.env.NODE_MODE == "TESTING") {
  const server = new AppServer({ port: 80 });
  server.start();
  module.exports = server;
} else {
  const createServer = (config = {}) => {
    const server = new AppServer(config);
    return server.start();
  };

  exports.createServer = createServer;
}

// exports.sessionCheck = sessionCheck
