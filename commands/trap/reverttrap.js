//base 
const { Command } = require("discord.js-commando");
//Database 
const path = require("path");
const sqlite = require("better-sqlite3");
const db = new sqlite(path.join(__dirname,"database.sqlite3"));

const dbcount = db.prepare("SELECT count(trappost_id) FROM trapposts WHERE guild_or_user_id =(?) ");
const dbremove = db.prepare("DELETE FROM trapposts WHERE trappost_id = (SELECT MAX(trappost_id) FROM trapposts WHERE guild_or_user_id = (?))");

module.exports = class RevertTrapCommand extends Command {
	constructor(client) {
		super(client, {
			name: "reverttrap",
			memberName: "revert",
			group: "trap",
			description: "Reverts the last posted imges in the database",
			throttling: {
				usages: 1, // in the time frame
				duration: 10 // in seconds
			},
			examples: ["revert 5"],
			details: "Reverts the last posted imges in the db from your server/ user(server if you use this command in a server/ user id you use this command in a DM or anyother than a server. This will not delete anything from the server.",
			guarded: true,
			ownerOnly: true,
			argsCount: 1, // max numbers
			args: [{
				key: "number",
				prompt: "how many would you like to revert from the database",
				type: "integer",
				
			}]
		});
	}

	run(msg, { number }) {
		for (let i = 0; i < number; i++) {
			dbremove.run(msg.guild ? msg.guild.id : msg.author.id);
		}
	}
};