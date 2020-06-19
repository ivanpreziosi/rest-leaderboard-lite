const fs = require("fs");
// init sqlite db
const dbFile = "leaderboard_sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

const db_dump = require("../app_modules/DbStructure");

db.serialize(() => {
  if (!exists) {
    db.exec(db_dump, function(query_err) {
      if (query_err) {
        console.log("ERR");
        console.log(query_err);
      }
    });
    console.log("New leaderboard db created!");    
  } else {
    console.log("Database leaderboard ready to go!");
    /*db.all("select * from user", function(query_err, result) {
      if (query_err) {
        console.log("test query ERR");
        console.log(query_err);
      } else {
        console.log("test query OK");
        console.log(result);
      }
    });*/
  }
});
module.exports = db;
