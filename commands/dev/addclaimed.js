//Base
const { Command } = require("discord.js-commando");

//Datebase
const path = require("path");
const sqlite = require("better-sqlite3");
const db = new sqlite(path.join(__dirname,"database.sqlite3"));

const dbinsert = db.prepare("INSERT INTO mudaeusers VALUES (?, datetime(?))");
// const dbdel = db.prepare("DELETE FROM mudaeusers WHERE name = \"DIO the chat stalker\"").run();

module.exports = class AddClaimedCommand extends Command {
	constructor(client) {
		super(client, {
			name: "addclaimed",
			memberName: "add",
			group: "dev",
			description: "",
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: [],
			details: "",
			ownerOnly:true,
		});
	}
	run(msg) {
		let now = new Date(msg.createdTimestamp).toISOString();
		msg.mentions.users.forEach(e => {
			dbinsert.run(e.username,now);
		});
	}
};
