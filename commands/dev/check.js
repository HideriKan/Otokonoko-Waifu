//Base
const { Command } = require("discord.js-commando");

//Embed
const { RichEmbed, Collection } = require("discord.js");

//Datebase
const path = require("path");
const sqlite3 = require("better-sqlite3");
const db = new sqlite3(path.join(__dirname, "database.sqlite3"));

db.prepare("DROP TABLE IF EXISTS mudaeusers").run();
db.prepare("CREATE TABLE IF NOT EXISTS mudaeusers("+
	"name text NOT NULL ,"+
	"time_send datetime NOT NULL)"
).run();


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
			ownerOnly:true,
		});
	}

	test(msg, userName) {
		msg.channel.send(userName);
	}


	run(msg) { // if online // if claim is ready
		let roleMembers = new Collection();
		let role = msg.guild.roles.find("name", "Waifu Squad");
		roleMembers = role.members.array();
		roleMembers.sort((a, b) => {
			if (a.highestRole.calculatedPosition > b.highestRole.calculatedPosition) {
				return -1;
			} else if (a.highestRole.calculatedPosition < b.highestRole.calculatedPosition) {
				return 1;
			}
			return 0;
		}); //TODO: sort by order of memberlist


		const embed = new RichEmbed()
			// .setTitle("Mudae Claims")
			.setDescription(roleMembers.map(m => m.displayName).join("\n"));
		msg.channel.send(embed);
	}
};

