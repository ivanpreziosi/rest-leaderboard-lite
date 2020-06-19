var createError = require("http-errors");

exports.checkAuth = async function(request, response, next) {
  var hUsername = request.header("username");
  var hToken = request.header("x-ldb-token");
  var sessionLifetime = 25; //session lifetime in seconds (defaults to 25)

  var db = require("../app_modules/SqliteInit");
  var sqlSelect =
    "SELECT id, username FROM user WHERE username = ? AND ((julianday(CURRENT_TIMESTAMP) - julianday(token_creation_date)) * 1440.0) < " +
    sessionLifetime +
    " AND auth_token = ?  AND is_deleted = 0 LIMIT 1";
  
  db.get(sqlSelect, [hUsername, hToken], function(err, row) {
    if (err) {
      console.log("ERR");
      return next(err);
    } else {
      if (row == undefined) {
        var sqlUpdate =
          "UPDATE `user` SET `auth_token`= NULL, token_creation_date = NULL WHERE `username`= ?";
        db.run(sqlUpdate, [hUsername], function(query_err, result) {
          if (query_err) {
            console.log("ERR");
            next(query_err);
          } else {
            console.log(
              "auth invalid. reset token data for user: " +
                JSON.stringify(hUsername)
            );
          }
        });

        return next(createError(403, "Authentication error."));
      } else {
        //console.log(row);
        var sqlUpdate =
          "UPDATE `user` SET token_creation_date = CURRENT_TIMESTAMP WHERE `username`= ?";
        db.run(sqlUpdate, [hUsername], function(query_err) {
          if (query_err) {
            console.log("ERR");
            next(query_err);
          } else {
            console.log("auth valid for user: " + JSON.stringify(row.username));
            next();
          }
        });
      }
    }
  });
};

exports.getHashedPassword = function(plainPwd) {
  var md5 = require("js-md5");
  var salt = "default_sad_salt";
  var hashedPwd = md5(salt + plainPwd + salt);
  return hashedPwd;
};
