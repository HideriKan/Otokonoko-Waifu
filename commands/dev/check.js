//Base
const { Command } = require("discord.js-commando");

//Embed
const { RichEmbed } = require("discord.js");

//Datebase
const path = require("path");
const sqlite3 = require("better-sqlite3");
const db = new sqlite3(path.join(__dirname, "database.sqlite3"));

// db.prepare("DROP TABLE IF EXISTS mudaeusers").run();
// db.prepare("DELETE");
db.prepare("CREATE TABLE IF NOT EXISTS mudaeusers("+
	"name text NOT NULL ,"+
	"time_send datetime NOT NULL)"
).run();
const getusers = db.prepare("SELECT * FROM mudaeusers");

function tests(status) {
	switch (status) {
	case "online":
		"⚫";
		break;
	case "offline":
		"🔵";
		break;
	case "idle":
		"🔴";
		break;
	case "dnd":
		"⚪";
	}
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
			ownerOnly:true,
		});
	}

	test(msg, userName) {
		msg.channel.send(userName);
	}


	run(msg) { // if online // if claim is ready

		//get memebers of the Role
		let role = msg.guild.roles.find("name", "Waifu Squad");
		let roleMembers, users = [], allUsers = [];

		roleMembers = role.members.array();
		let dbusers = getusers.all();
		dbusers.forEach(e => {
			users.push(role.members.find(member => member.user.username == e.name));
		});
		let claim = roleMembers.filter(e => !users.includes(e));
		let noClaim = roleMembers.filter(e => !claim.includes(e));

		claim.forEach(e => {
			let comUser = new ComUser(tests(e.user.presence.status), e.displayName, true);
			allUsers.push(comUser);
		});
		noClaim.map(m => {
			let comUser = new ComUser(tests(m.user.presence.status), m.displayName);
			allUsers.push(comUser);
		});

		allUsers.sort((a, b) => {
			if (a.hoistRole || b.hoistRole) {
				if (a.hoistRole.calculatedPosition > b.hoistRole.calculatedPosition) {
					return -1;
				} else if (a.hoistRole.calculatedPosition < b.hoistRole.calculatedPosition) {
					return 1;
				} else if (a.hoistRole.calculatedPosition == b.hoistRole.calculatedPosition) {
					return a.nickname - b.nickname;
				}
			} else {
				if (a.highestRole.calculatedPosition > b.highestRole.calculatedPosition) {
					return -1;
				} else if (a.highestRole.calculatedPosition < b.highestRole.calculatedPosition) {
					return 1;
				} else if (a.highestRole.calculatedPosition == b.highestRole.calculatedPosition) {
					return a.nickname - b.nickname;
				}
			}
			return 0;
		}); //TODO: sort by order of memberlist


		const embed = new RichEmbed()
			// .setTitle("Mudae Claims")
			.addField("no", );
		msg.channel.send(embed);
	}
};

function ComUser(status, name, claimed = false) {
	this.status = status;
	this.name = name;
	this.claimed = claimed;
}
