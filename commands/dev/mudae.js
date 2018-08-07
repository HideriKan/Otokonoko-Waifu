//Base
const { Command } = require("discord.js-commando");

//Datebase
const path = require("path");
const sqlite = require("better-sqlite3");
const db = new sqlite(path.join(__dirname,"database.sqlite3"));

const dbcheck = db.prepare("SELECT * FROM mudaeusers WHERE name = ?");
const dbinsert = db.prepare("INSERT INTO mudaeusers VALUES (?, 1)");
const dbdel = db.prepare("DELETE FROM mudaeusers WHERE name = ?");
const dbreset = db.prepare("UPDATE mudaeusers SET claimed = 1 WHERE claimed = 0");

module.exports = class MudaeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "mudae",
			memberName: "m",
			group: "dev",
			description: "listing command for check",
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: ["m"],
			details: "`add` or `remove` fromt he check list for mudae",
			// ownerOnly:true,
			args:[
				{
					key: "method",
					prompt: "What method would you like to perform `add` or `remove`",
					type: "string"
				},
				{
					key: "text",
					prompt: "With what args?",
					type: "string",
					default: ""
				}
			]
		});
	}

	run(msg,{method , text}) {
		if (method == "add") {
			if (msg.mentions.users.size) {
				msg.mentions.users.forEach(e => {
					let check = dbcheck(e.username);
					if (!check)
						return msg.channel.send(e.username+ " is already is the list everyone **AFTER** this user is now in the list");
					dbinsert.run(e.username);
					return msg.channel.send("everyone got added to the list");
				});
			} else if (text) {
				if (!msg.guild.members.find("name",text))
					return msg.channel.send("noone found with that name in your server");
				let check = dbcheck.all(text);
				if (!check)
					return msg.reply("You are already in the list :Wink:");
				let users = text.split(",");
				users.forEach(e => dbinsert.run(e) );
			} else if (!text) {
				let check = dbcheck.all(msg.author.username);
				if (!check)
					return msg.reply("You are already in the list :Wink:");
				dbinsert.run(msg.author.username);
				return msg.channel.send("added " + msg.author.username);
			}
		} else if (method == "remove") {
			dbdel.run(text);
			return msg.channel.send("donno if it worked but you maybe removed " + text);
		} else if (method == "reset") {
			dbreset.run();
		}
	}
};
