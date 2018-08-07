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
	"id text NOT NULL,"+
	"guild_id text NOT NULL,"+
	"claimed integer DEFAULT 1)"
).run();
const getusers = db.prepare("SELECT * FROM mudaeusers");

// first this
// db.prepare("CREATE TABLE IF NOT EXISTS temp("+ 
// 	"name text NOT NULL ," + 
// 	"claimed integer DEFAULT 1)"
// ).run()
// const tempin = db.prepare("INSERT INTO temp VALUES (?, ?)");
// const table = db.prepare("SELECT * FROM mudaeusers").all();
// table.forEach(e => {
// 	tempin.run(e.name, e.claimed);
// });
// then this
// const aftertemp = db.prepare("SELECT * FROM temp").all();
// const afterin = db.prepare("INSERT INTO mudaeusers VALUES (?, ?, ?)");
// aftertemp.forEach(e => {
// 	afterin.run(e.name, "303648302707245056", e.claimed);
// });
db.prepare("DROP TABLE IF EXISTS temp").run();

function ComUser(status, member, userObj, claimed = false) {
	this.status = status;
	this.member = member;
	this.user = userObj;
	this.claimed = claimed ? "✅" : "❌";
}

module.exports = class CheckCommand extends Command {
	constructor(client) {
		super(client, {
			name: "check",
			memberName: "c",
			group: "dev",
			description: "list the claims of mudae",
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: ["mu"],
			details: "List all users that got added to the list from the mudae add command",
			guildOnly: true,
			// ownerOnly:true,
		});
	}

	run(msg) { // if online // if claim is ready
		let allUsers = [];
		let dbusers = getusers.all();

		dbusers.forEach(e => {
			let member = msg.guild.members.find(member => member.user.id == e.id);
			let comUser = new ComUser
			(member.user.presence.status, e.id, member, e.claimed);
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

		let online = [],
			offline = [],
			idle = [],
			dnd = [];
		allUsers.forEach(e => {
			if (e.status == "online") online.push(e);
			if (e.status == "offline") offline.push(e);
			if (e.status == "idle") idle.push(e);
			if (e.status == "dnd") dnd.push(e);
		});

		const embed = new RichEmbed()
			.setTitle("Mudae Claims")
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			.setFooter("if you want to be in this list do " + msg.client.commandPrefix+"mudae add")
			;
		if (online.length != 0)
			embed.addField("Online", online.map(e => `${e.claimed} ${e.user.displayName}`).join("\n"), true);
		if (idle.length != 0)
			embed.addField("Idle", idle.map(e => `${e.claimed} ${e.user.displayName}`).join("\n"), true);
		if (dnd.length != 0)
			embed.addField("Do not Disturb", dnd.map(e => `${e.claimed} ${e.user.displayName}`).join("\n"), true);
		if (offline.length != 0)
			embed.addField("Offline", offline.map(e => `${e.claimed} ${e.user.displayName}`).join("\n"), true);
			// .setDescription(allUsers.map(e=> e.claimed + " " + e.name).join("\n"));

			// get now
			// get next reset
			// get time left till next reset
			// now - nextR

		msg.channel.send(embed);
	}
};