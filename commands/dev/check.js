//Base
const { Command } = require("discord.js-commando");

//Embed
const { RichEmbed } = require("discord.js");

//Datebase
const path = require("path");
const sqlite3 = require("better-sqlite3");
const db = new sqlite3(path.join(__dirname, "database.sqlite3"));

// db.prepare("DROP TABLE IF EXISTS mudaeusers").run();
db.prepare("CREATE TABLE IF NOT EXISTS mudaeusers("+
	"name text NOT NULL ,"+
	"time_send datetime NOT NULL)"
).run();
const getusers = db.prepare("SELECT * FROM mudaeusers");

// function tests(status) {
// 	switch (status) { // maybe with hearts
// 	case "online":
// 		// return "🍈";
// 		return "online";
// 	case "offline":
// 		// return "⚫";
// 		return "offline";
// 	case "idle":
// 		// return "🍊";
// 		return "idle".padEnd(10,"\xa0");
// 	case "dnd":
// 		// return "🔴";
// 		return "dnd".padEnd(9,"\xa0");
// 	}	
// }

function ComUser(status, name, userObj, claimed = false) {
	this.status = status;//tests(status);
	this.name = name;
	this.user = userObj;
	this.claimed = claimed ? "✅" : "❌";
}

module.exports = class CheckCommand extends Command {
	constructor(client) {
		super(client, {
			name: "check",
			memberName: "check",
			group: "dev",
			description: "checks",
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: [],
			examples: [],
			details: "check",
			guildOnly: true,
			// ownerOnly:true,
		});
	}

	test(msg, userName) {
		msg.channel.send(userName);
	}


	run(msg) { // if online // if claim is ready

		//get memebers of the Role
		let role = msg.guild.roles.find("name", "Waifu Squad"); // check if role is in guild
		let roleMembers, users = [], allUsers = [];

		roleMembers = role.members.array();
		let dbusers = getusers.all();
		dbusers.forEach(e => {
			users.push(role.members.find(member => member.user.username == e.name));
		});
		let claim = roleMembers.filter(e => !users.includes(e));
		let noClaim = roleMembers.filter(e => !claim.includes(e));

		claim.forEach(e => {
			let comUser = new ComUser(e.user.presence.status, e.displayName, e, true);
			allUsers.push(comUser);
		});
		noClaim.map(m => {
			let comUser = new ComUser(m.user.presence.status, m.displayName, m);
			allUsers.push(comUser);
		});

		let local = "en";
		try {
			allUsers.sort((a, b) => { // need fix with special chars z.b. ß
				if (a.user.hoistRole && b.user.hoistRole) {
					if (a.user.hoistRole.calculatedPosition > b.user.hoistRole.calculatedPosition) {
						return -1;
					} else if (a.user.hoistRole.calculatedPosition < b.user.hoistRole.calculatedPosition) {
						return 1;
					} else if (a.user.hoistRole.calculatedPosition == b.user.hoistRole.calculatedPosition) {
						return a.user.displayName.localeCompare(b.user.displayName, local, {sensitivity: "case"});
					} else if (a.user.hoistRole) {
						return -1;
					} else if (b.user.hoistRole) {
						return 1;
					}
				} else {
					return a.user.displayName.localeCompare(b.user.displayName, local, {sensitivity: "case"});
				}
				return 0;
			}); //TODO: sort by order of memberlist
	
		} catch (error) {
			console.error(error);
		}

		const embed = new RichEmbed()
			.setTitle("Mudae Claims")
			.setDescription(allUsers.map(e=> e.claimed + " " + e.name).join("\n"));
		msg.channel.send(embed);
	}
};