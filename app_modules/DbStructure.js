const db_structure = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "leaderboard" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"user_id"	INTEGER NOT NULL,
	"score"	INTEGER NOT NULL,
	"save_date"	INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"is_deleted"	INTEGER NOT NULL,
	"sender_ip"	TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "user" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	"is_deleted"	INTEGER NOT NULL DEFAULT 0,
	"date_subscribed"	INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"auth_token"	TEXT,
	"token_creation_date"	INTEGER
);
COMMIT;
`;

module.exports = db_structure;