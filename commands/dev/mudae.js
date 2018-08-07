//Base
const { Command } = require("discord.js-commando");

//Datebase
const path = require("path");
const sqlite = require("better-sqlite3");
const db = new sqlite(path.join(__dirname,"database.sqlite3"));

const dbinsert = db.prepare("INSERT INTO mudaeusers VALUES (?, ?, 0)");
const dbcheck = db.prepare("SELECT * FROM mudaeusers WHERE id = ?");
const dbreset = db.prepare("UPDATE mudaeusers SET claimed = 1 WHERE claimed = 0");
const dbdel = db.prepare("DELETE FROM mudaeusers WHERE id = ?");
const dbclaimed = db.prepare("UPDATE mudaeusers SET claimed = 1 WHERE id = ?");

module.exports = class MudaeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "mudae",
			memberName: "m",
			group: "dev",
			description: "listing command for check",
			guildOnly: true,
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
			// adds user(s) depending with different args
			
			if (msg.mentions.members.size) {
				//if anyone got mentioned
			
				msg.mentions.members.forEach(e => {
					let check = dbcheck.get(e.user.id);
					if (check)
						return msg.channel.send(e.displayName + " is already is the list everyone **BEFORE** this user is now in the list");
					dbinsert.run(e.user.id,e.guild.id);
					return msg.channel.send("added " + e.user.displayName);
				});

			} else if (text) {
				// if with any text afterwards is passed
			
				let users = text.split(",");
				users.forEach(e => {
					if (!msg.guild.members.find("id", text)) return msg.channel.send("noone found with that id on your server");
					let check = dbcheck.get(text);
					if (check) return msg.reply("User is already in the list :Wink:");
					dbinsert.run(e, msg.guild.id);
					return msg.channel.send("added " + e);

				});

			} else if (!text) {
				// if only add is passed

				let check = dbcheck.get(msg.author.id);
				if (check) return msg.reply("You are already in the list :Wink:");
				dbinsert.run(msg.author.id, msg.guild.it);
				return msg.channel.send("added " + msg.author.username);
			}

		} else if (method == "remove") {
			// removes the user from the list
			if(text) {
				dbdel.run(text);
				return msg.channel.send("donno if it worked but the user maybe got removed " + text);
			}
			dbdel.run(msg.author.id);
			return msg.channel.send("donno if it worked but you maybe got removed " + text);

		} else if (method == "reset") {
			// sets all users claimed to 0

			dbreset.run();
		} else if (method == "claimed") {
			// change the claimed status
			if (text) {
				// seaches for the passed userId
				
				let check = dbcheck.get(text);
				if (check) return msg.channel.send("User not found in List");
				dbclaimed.run(text);
			
			} else if (!text) {
				// just takes the author id

				dbclaimed.run(msg.author.id);
			}
		}
	}
};
