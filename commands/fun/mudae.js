//Base
const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const trim = (str, max = 22) => (str.length > max) ? `${str.slice(0, max-3)}...` : str;

//Datebase
const path = require("path");
const sqlite = require("better-sqlite3");
const db = new sqlite(path.join(__dirname,"/../../database.sqlite3"));

// db.prepare("DROP TABLE IF EXISTS mudaeusers").run();
db.prepare("CREATE TABLE IF NOT EXISTS mudaeusers("+
	"id text NOT NULL,"+
	"guild_id text NOT NULL,"+
	"claimed integer DEFAULT 1)"
).run();
const getusers = db.prepare("SELECT * FROM mudaeusers");
const dbcheck = db.prepare("SELECT * FROM mudaeusers WHERE id = ?");
const dbinsert = db.prepare("INSERT INTO mudaeusers VALUES (?, ?, 0)");
const dbdel = db.prepare("DELETE FROM mudaeusers WHERE id = ?");
const dbreset = db.prepare("UPDATE mudaeusers SET claimed = 1 WHERE claimed = 0");
const dbSetClaim = db.prepare("UPDATE mudaeusers SET claimed = ? WHERE id = ?"); // 1 == has claim; 0 == has no claim;

function send(msg,text) {
	msg.channel.send(text);
}

function ComUser(status, memberObj, hasClaim = false) {
	let memberDisplayName = memberObj.displayName.toString().replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "");
	if (!memberDisplayName) memberDisplayName = "guyWithOnlyEmotes";
	this.status = status;
	this.member = memberObj;
	this.memberDisplayName = memberDisplayName;
	this.claimed = hasClaim ? "✅" : "❌";
}

function nextRestInTimeString() {
	const addZero = (element) => element.toString().padStart(2, 0);
	let now = new Date();
	let UTCNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	let hour = now.getUTCHours();
	let h, m, s, ms;

	switch (hour % 3) {
	case 0:
		hour += 1;
		break;
	case 1:
		if (now.getUTCMinutes() < 5) break;
		hour += 3;
		break;
	case 2:
		hour += 2;
		break;
	}

	let date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 4, 0, 0);
	ms = date - UTCNow;

	s = Math.floor(ms /1000);
	m = Math.floor(s / 60);
	s = s % 60;
	h = Math.floor(m / 60);
	m = m % 60;
	h = h % 24;

	return `${addZero(h)}:${addZero(m)}:${addZero(s)}`;
}

module.exports = class MudaeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "mudae",
			memberName: "mudea",
			group: "fun",
			description: "List for Mudae Bot and more",
			guildOnly: true,
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: ["m", "mu", "c"],
			details: "List all users that got added to the list from the mudae add command. Can also perform a method `add`, `remove`, `claim`, `noclaim` or `reset` all can be used by the normal user except reset",
			ownerOnly:true,
			args:[
				{
					key: "method",
					prompt: "What method; `add`, `remove`, `claim`, `noclaim` or `reset`?",
					type: "string",
					default: "",
					validate: method => {
						let avaliavbleArgs = ["add", "remove", "claim", "noclaim", "reset"];

						if(avaliavbleArgs.includes(method.toLowerCase()))
							return true;
					},
					parse: method => method.toLowerCase()
				},
				{
					key: "text",
					prompt: "Need User ID",
					type: "string",
					default: ""
				}
			]
		});
	}

	run(msg,{method , text}) {
		if (method == "") {
			let allUsers = [];
			let dbusers = getusers.all();

			dbusers.forEach(e => {
				let member = msg.guild.members.find(member => member.user.id == e.id);
				let comUser = new ComUser(member.user.presence.status, member, e.claimed);
				allUsers.push(comUser);
			});

			let local = "en";
			try {
				allUsers.sort((a, b) => {
					if (a.member.hoistRole && b.member.hoistRole) {
						if (a.member.hoistRole.calculatedPosition > b.member.hoistRole.calculatedPosition) {
							return -1;
						} else if (a.member.hoistRole.calculatedPosition < b.member.hoistRole.calculatedPosition) {
							return 1;
						} else if (a.member.hoistRole.calculatedPosition == b.member.hoistRole.calculatedPosition) {
							return a.member.displayName.localeCompare(b.member.displayName, local, {sensitivity: "case"});
						} else if (a.member.hoistRole) {
							return -1;
						} else if (b.member.hoistRole) {
							return 1;
						}
					} else {
						return a.member.displayName.localeCompare(b.member.displayName, local, {sensitivity: "case"});
					}
					return 0;
				});

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
				.setFooter(`if you want to be in this list do ${msg.client.commandPrefix}mudae add | next reset is in ${nextRestInTimeString()}`);

			if (online.length != 0)
				embed.addField("Online", online.map(e => `${e.claimed} \`${trim(e.memberDisplayName)}\``).join("\n"), true);
			if (offline.length != 0)
				embed.addField("Offline", offline.map(e => `${e.claimed} \`${trim(e.memberDisplayName)}\``).join("\n"), true);
			if (idle.length != 0)
				embed.addField("Idle", idle.map(e => `${e.claimed} \`${trim(e.memberDisplayName)}\``).join("\n"), true);
			if (dnd.length != 0)
				embed.addField("Do not Disturb", dnd.map(e => `${e.claimed} \`${trim(e.memberDisplayName)}\``).join("\n"), true);

			msg.channel.send(embed);

		// adds user(s) depending with different args
		} else if (method == "add") {

			//if anyone got mentioned
			if (msg.mentions.members.size) {

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with `@user` is Owner only");
				msg.mentions.members.forEach(e => {
					let check = dbcheck.get(e.user.id);
					if (check)
						return send(msg, e.displayName + " is already is the list, everyone **BEFORE** this user is now in the list");
					dbinsert.run(e.user.id,e.guild.id);
					return send(msg, "added " + e.user.displayName);
				});

			// if with any text afterwards is passed
			} else if (text) {

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				let member = msg.guild.members.find("id", text);
				if (!member) return send(msg, "noone found with that id on your server");
				let check = dbcheck.get(text);
				if (check) return msg.reply("User(s) is already in the list :Wink:");
				dbinsert.run(text, msg.guild.id);
				return send(msg, "added " + member.displayName);

			// if only add is passed
			} else if (!text) {

				let check = dbcheck.get(msg.author.id);
				if (check) return send(msg, "You are already in the list :Wink:");
				dbinsert.run(msg.author.id, msg.guild.id);
				return send(msg, "added " + msg.member.displayName);
			}

		// removes the user from the list
		} else if (method == "remove") {
			if(text) {

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				dbdel.run(text);
				let member = msg.guild.members.find("id", text);
				if(!member) return send(msg,"This user is not a member of this guild");
				return send(msg, member.displayName +  " got removed");
			}
			dbdel.run(msg.author.id);
			return send(msg, msg.member.displayName + " got removed from the list");

		// sets all users claimed to 0
		} else if (method == "reset") {

			if (!msg.client.isOwner(msg.author)) return send(msg, "This is a Owner only method");
			dbreset.run();
			send(msg, "List reset");

			// change the claimed status
		} else if (method == "claim") {
			// seaches for the passed userId
			if (text) {

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				let member = msg.guild.members.find("id", text);
				let check = dbcheck.get(text);
				if (!check) return send(msg, "User not found in List");
				dbSetClaim.run(1, text);
				send(msg, member.displayName + " now has a claim in the List");


			// just takes the author id
			} else if (!text) {

				dbSetClaim.run(1, msg.author.id);
				send(msg,msg.member.displayName + " now has a claim in the List");
			}
		// change the claimed status
		} else if (method == "noclaim") {
			// seaches for the passed userId
			if (text) {

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				let member = msg.guild.members.find("id", text);
				let check = dbcheck.get(text);
				if (!check) return send(msg, "User not found in List");

				dbSetClaim.run(0, text);
				send(msg, member.displayName + " now has not a claim in the List");

			// just takes the author id
			} else if (!text) {

				dbSetClaim.run(0, msg.author.id);
				send(msg,msg.member.displayName + " now has not a claim in the List");
			}

		}
	}
};