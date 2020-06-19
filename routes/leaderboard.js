var express = require("express");
var router = express.Router();
var createError = require("http-errors");
const { body, query, header, validationResult } = require("express-validator");
//var validator = require('validator');

/* GET score listing. */
router.get(
  "/",
  [
    //express-validator rules stack
    query("limit")
      .customSanitizer((value, { req }) => {
        return value !== undefined && value !== "" ? value : 50;
      })
      .isNumeric()
      .withMessage("has to be numeric")
      .bail()
      .isInt({ min: 1, max: 150 })
      .withMessage("must be an integer (min:1, max:150)"),

    query("offset")
      .customSanitizer((value, { req }) => {
        return value !== undefined && value !== "" ? value : 0;
      })
      .isNumeric()
      .withMessage("has to be numeric")
      .bail()
      .isInt({ min: 0 })
      .withMessage("must be an integer (min:0)")
  ],
  function(req, res, next) {
    var db = require("../app_modules/SqliteInit");

    //GET PARAM in query string
    var limit = req.query.limit;
    var offset = req.query.offset;
    var order = req.query.order == "ASC" ? "ASC" : "DESC";

    //VALIDATION CHECK
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(JSON.stringify(errors));

      var errorString = "Errors: ";
      var isFirst = true;
      errors.array().forEach(element => {
        if (!isFirst) {
          errorString += " - ";
        }
        errorString += element.param + ": " + element.msg;
        isFirst = false;
      });

      //create 400 http error code: Bad Request
      next(createError(400, errorString));
    } else {
      //validation OK
      var sql =
        "SELECT u.username, l.score, l.save_date FROM leaderboard l LEFT OUTER JOIN user u on l.user_id = u.id WHERE l.is_deleted = 0 AND u.is_deleted = 0 ORDER BY score " +
        order +
        " LIMIT ?,?";
      db.all(sql, [parseInt(offset), parseInt(limit)], function(
        query_err,
        result
      ) {
        if (query_err) {
          console.log("ERR");
          next(query_err);
        } else {
          console.log("returning leaderboard list");
          var leaderboardResponse = {
            status: "OK",
            message: "Leaderboard successfully retrieved",
            code: "LEADERBOARD-RETRIEVED-SUCCESS",
            payload: result
          };

          //write to result object
          res.writeHead(200, { "Content-Type": "text/json" });
          res.write(JSON.stringify(leaderboardResponse));
          res.end();
        }
      });
    }
  }
);

/* POST a new hiscore to the leaderboard */
router.post(
  "/save",
  [
    //express-validator rules stack
    body("score")
      .exists()
      .withMessage("is required")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("is required")
      .bail()
      .isNumeric()
      .withMessage("has to be numeric")
      .isInt()
      .withMessage("must be an integer")
  ],
  function(req, res, next) {
    //VALIDATION CHECK
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(JSON.stringify(errors));

      var errorString = "Errors: ";
      var isFirst = true;
      errors.array().forEach(element => {
        if (!isFirst) {
          errorString += " - ";
        }
        errorString += element.param + ": " + element.msg;
        isFirst = false;
      });

      //create 400 http error code: Bad Request
      next(createError(400, errorString));
    } else {
      // GETTING THE USER FROM HEADER DATA
      var hUsername = req.header("username");
      var hToken = req.header(process.env.TOKENNAME || "x-ldb-token");

      // SAVING HISCORE
      console.log("saving score");

      var score = req.body.score;
      var get_ip = require("ipware")().get_ip;
      var ip_info = get_ip(req);
      var db = require("../app_modules/SqliteInit");
      var sql =
        "INSERT INTO `leaderboard` (`user_id`, `score`, `is_deleted`,`sender_ip`) VALUES ((SELECT id FROM user WHERE username = ? AND auth_token = ?),?,0,?);";

      db.run(sql, [hUsername, hToken, score, ip_info.clientIp], function(
        query_err,
        result
      ) {
        if (query_err) {
          console.log("ERR");
          next(query_err);
        } else {
          console.log("hiscore inserted");

          var leaderboardResponse = {
            status: "OK",
            message: "Hiscore inserted",
            code: "LEADERBOARD-INSERTED-SUCCESS"
          };

          //write to result object
          res.writeHead(200, { "Content-Type": "text/json" });
          res.write(JSON.stringify(leaderboardResponse));
          res.end();
        }
      });
    }
  }
);

module.exports = router;
