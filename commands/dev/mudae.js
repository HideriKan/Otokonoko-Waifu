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

function send(msg,text) {
	msg.channel.send(text);
}

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
				
				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with `@user` is Owner only");
				msg.mentions.members.forEach(e => {
					let check = dbcheck.get(e.user.id);
					if (check)
						return send(msg, e.displayName + " is already is the list, everyone **BEFORE** this user is now in the list");
					dbinsert.run(e.user.id,e.guild.id);
					return send(msg, "added " + e.user.displayName);
				});

			} else if (text) {
				// if with any text afterwards is passed
			
				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				let member = msg.guild.members.find("id", text);
				if (!member) return send(msg, "noone found with that id on your server");
				let check = dbcheck.get(text);
				if (check) return msg.reply("User(s) is already in the list :Wink:");
				dbinsert.run(text, msg.guild.id);
				return send(msg, "added " + member.displayName);

			} else if (!text) {
				// if only add is passed

				let check = dbcheck.get(msg.author.id);
				if (check) return send(msg, "You are already in the list :Wink:");
				dbinsert.run(msg.author.id, msg.guild.id);
				return send(msg, "added " + msg.member.displayName);
			}

		} else if (method == "remove") {
			// removes the user from the list
			if(text) {

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				dbdel.run(text);
				let member = msg.guild.members.find("id", text);
				if(!member) return send(msg,"This user is not a member of this guild");
				return send(msg, member.displayName +  " got removed");
			}
			dbdel.run(msg.author.id);
			return send(msg, msg.member.displayName + " got removed from the list");

		} else if (method == "reset") {
			// sets all users claimed to 0

			if (!msg.client.isOwner(msg.author)) return send(msg, "This is a Owner only method");
			dbreset.run();
			send(msg, "List reset");
		} else if (method == "claimed") {
			// change the claimed status
			if (text) {
				// seaches for the passed userId

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				let member = msg.guild.members.find("id", text); 
				let check = dbcheck.get(text);
				if (!check) return send(msg, "User not found in List");
				dbclaimed.run(text);
				send(msg, member.displayName + " now got a shown claim");
				
				
			} else if (!text) {
				// just takes the author id

				dbclaimed.run(msg.author.id);
				send(msg,msg.member.displayName + " now got a shown claim");
			}
		}
	}
};
