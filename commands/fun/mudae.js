//Base
const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const trim = (str, max = 19) => (str.length > max) ? `${str.slice(0, max-3)}...` : str;

//Datebase
const path = require("path");
const Sqlite = require("better-sqlite3");
const db = new Sqlite(path.join(__dirname,"/../../database.sqlite3"));

// db.prepare("DROP TABLE IF EXISTS mudaeusers").run();
db.prepare("CREATE TABLE IF NOT EXISTS mudaeusers("+
	"id text NOT NULL,"+
	"guild_id text NOT NULL,"+
	"claimed integer DEFAULT 1)"
).run();
const getusers = db.prepare("SELECT * FROM mudaeusers WHERE guild_id = ?");
const dbcheck = db.prepare("SELECT * FROM mudaeusers WHERE id = ? AND guild_id = ?");
const dbinsert = db.prepare("INSERT INTO mudaeusers VALUES (?, ?, 0)");
const dbdel = db.prepare("DELETE FROM mudaeusers WHERE id = ? AND guild_id = ?");
const dbreset = db.prepare("UPDATE mudaeusers SET claimed = 1 WHERE claimed = 0");
const dbSetClaim = db.prepare("UPDATE mudaeusers SET claimed = ? WHERE id = ? AND guild_id = ?"); // 1 === has claim; 0 === has no claim;
const getMuadeSettings = db.prepare("SELECT * FROM mudaesettings");
const setSetting = db.prepare("UPDATE mudaesettings SET bool = ? WHERE setting = ?");

/**
 * @param {message} msg message object
 * @param {text} text text to be posted into to channel
 */
function send(msg,text) {
	msg.channel.send(text);
}

function ComUser(status, memberObj, hasClaim = false) {
	let displayName = memberObj.displayName.toString().replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "");
	if (!displayName) displayName = "guyWithOnlyEmotes";
	this.status = status;
	this.member = memberObj;
	this.displayName = displayName;
	this.claimed = hasClaim ? "✅" : "❌";
}
/**
 *
 * @param int number of the inverval that is the reset in resetHour
 * @returns time for in next reset as a string
 */
function nextRestInTimeString(resetHour) {
	const addZero = (element) => element.toString().padStart(2, 0);
	let now = new Date();
	let UTCNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	let hour = now.getUTCHours();
	let h, m, s, ms;
	let mSettings = getMuadeSettings.all();

	if (mSettings[0].setting === "halfResetTime" && mSettings[0].bool === 1) { //this is the is DaylightSaving setting
		switch (hour % resetHour) {
		case 0:
			hour += 1;
			break;
		case 1:
			if (now.getUTCMinutes() < 4) break;
			hour += 3;
			break;
		case 2:
			if (resetHour === 1) {
				hour += 1;
				break;
			}

			hour += 2;
			break;
		}
	} else {
		switch (hour % resetHour) {
		case 0:
			if (resetHour === 1) {
				hour += 1;
				break;
			}

			hour += 2;
			break;
		case 1:
			hour += 1;
			break;
		case 2:
			if (now.getUTCMinutes() < 4) break;
			hour += 3;
			break;
		}
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
				usages: 1,
				duration: 5
			},
			aliases: ["m", "mu", "c"],
			details: "List all users that got added to the list from the mudae add command. Can also perform a method `add`, `remove`, `claim`, `noclaim` or `reset` all can be used by the normal user except reset",
			args:[
				{
					key: "method",
					prompt: "What method; `--less (-l)`, `add`, `remove`, `claim`, `noclaim`, `time` or `reset`?\n New: `setDaylightSaving`" ,
					type: "string",
					default: "",
					validate: method => {
						let avaliavbleArgs = ["--less", "-l", "add", "remove", "claim", "noclaim", "reset", "time", "setdaylightsaving"];

						if(avaliavbleArgs.includes(method.toLowerCase()))
							return true;
						return "unknown method\n" + this.argsCollector.args[0].prompt;
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
		//TODO: change send() to here for no need of the extra msg obj pass
		switch (method) {
		case "":
		case "--less":
		case "-l":{
			let allUsers = [];
			let dbusers = getusers.all(msg.guild.id);

			const embed = new RichEmbed()
				.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT");

			dbusers.forEach(e => {
				let member = msg.guild.members.find(member => member.user.id === e.id);
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
						} else if (a.member.hoistRole.calculatedPosition === b.member.hoistRole.calculatedPosition) {
							return a.member.displayName.localeCompare(b.member.displayName, local, {sensitivity: "case"});
						}
					} else if (a.member.hoistRole) {
						return -1;
					} else if (b.member.hoistRole) {
						return 1;
					} else if (a.member.highestRole.calculatedPosition && b.member.highestRole.calculatedPosition) {
						if(a.member.highestRole.calculatedPosition > b.member.highestRole.calculatedPosition) {
							return -1;
						} else if (a.member.highestRole.calculatedPosition < b.member.highestRole.calculatedPosition) {
							return 1;
						} else if (a.member.highestRole.calculatedPosition === b.member.highestRole.calculatedPosition) {
							return a.member.displayName.localeCompare(b.member.displayName, local, {sensitivity: "case"});
						}
					} else if (a.member.highestRole.calculatedPosition) {
						return -1;
					} else if (b.member.highestRole.calculatedPosition) {
						return 1;
					}
					return a.member.displayName.localeCompare(b.member.displayName, local, {sensitivity: "case"});
				});

			} catch (error) {
				console.error(error);
			}

			if (method === "") {
				embed
					.setTitle("Mudae Claims")
					.setFooter(`if you want to be in this list do ${msg.client.commandPrefix}mudae add | next reset is in ${nextRestInTimeString(3)}`);

				let online = [],
					offline = [],
					idle = [],
					dnd = [];
				allUsers.forEach(e => {
					if (e.status === "online") online.push(e);
					if (e.status === "offline") offline.push(e);
					if (e.status === "idle") idle.push(e);
					if (e.status === "dnd") dnd.push(e);
				});

				if (online.length != 0)
					embed.addField("Online", online.map(e => `${e.claimed} \`\`${trim(e.displayName)}\`\``).join("\n"), true);
				if (offline.length != 0)
					embed.addField("Offline", offline.map(e => `${e.claimed} \`\`${trim(e.displayName)}\`\``).join("\n"), true);
				if (idle.length != 0)
					embed.addField("Idle", idle.map(e => `${e.claimed} \`\`${trim(e.displayName)}\`\``).join("\n"), true);
				if (dnd.length != 0)
					embed.addField("Do not Disturb", dnd.map(e => `${e.claimed} \`\`${trim(e.displayName)}\`\``).join("\n"), true);
			} else if (method === "--less" || method === "-l") {
				embed
					.setTitle("Users with a Claim")
					.setFooter(`next reset is in ${nextRestInTimeString(3)}`);

				allUsers = allUsers.filter(e => e.claimed === "✅" && e.status === "online");
				embed.setDescription(allUsers.map(e => `\`\`${e.displayName}\`\``).join("\n"));
			}

			msg.channel.send(embed);



			break;
		}
		case "add":
			if (msg.mentions.members.size) { //if anyone got mentioned
				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with `@user` is Owner only");
				msg.mentions.members.forEach(e => {
					let check = dbcheck.get(e.user.id, msg.guild.id);

					if (check) {
						if (msg.mentions.members.size() === 1)
							return send(msg, e.displayName + " is already in the List");
						return send(msg, e.displayName + " is already in the List, everyone **BEFORE** this user is now in the list");
					}

					dbinsert.run(e.user.id,e.guild.id);
					return send(msg, "added " + e.user.displayName);
				});

			} else if (text) { // if with any text afterwards is passed

				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");
				let member = msg.guild.members.find("id", text);
				if (!member) return send(msg, "noone found with that id on your server");
				let check = dbcheck.get(text, msg.guild.id);
				if (check) return msg.reply("User(s) is already in the list <:AstolfoWink:438580142210809856>");
				dbinsert.run(text, msg.guild.id);
				return send(msg, "added " + member.displayName);

			} else if (!text) { // if only add is passed
				let check = dbcheck.get(msg.author.id, msg.guild.id);

				if (check) return send(msg, "You are already in the list <:AstolfoWink:438580142210809856>");
				dbinsert.run(msg.author.id, msg.guild.id);
				return msg.reply("added you to the list.\nYou can now if wanted `mudae remove` to remove yourself from the list\nand you can `mudae claim`/`noclaim` to set your claim status if the Bot doesnt record your claim.");
			}
			break;
		case "remove":
			if(text) {
				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");

				dbdel.run(text, msg.guild.id);
				let member = msg.guild.members.find("id", text);
				if(!member) return send(msg,"This user is not a member of this guild");
				return send(msg, member.displayName +  " got removed");
			}
			dbdel.run(msg.author.id, msg.guild.id);
			return send(msg, msg.member.displayName + " got removed from the list");
		case "reset":
			// if (!msg.client.isOwner(msg.author)) return send(msg, "This is a Owner only method");

			dbreset.run();
			send(msg, "List reset");
			break;
		case "claim":
			if (text) { // seaches for the passed userId
				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");

				let member = msg.guild.members.find("id", text);
				let check = dbcheck.get(text, msg.guild.id);
				if (!check) return send(msg, "User not found in List");
				dbSetClaim.run(1, text, msg.guild.id);
				send(msg, member.displayName + " now has a claim in the List");


			} else if (!text) { // just takes the author id

				dbSetClaim.run(1, msg.author.id, msg.guild.id);
				send(msg,msg.member.displayName + " now has a claim in the List");
			}
			break;
		case "noclaim":
			if (text) {// seaches for the passed userId
				if (!msg.client.isOwner(msg.author)) return send(msg, "This method with text is Owner only");

				let member = msg.guild.members.find("id", text);
				let check = dbcheck.get(text, msg.guild.id);
				if (!check) return send(msg, "User not found in List");

				dbSetClaim.run(0, text, msg.guild.id);
				send(msg, member.displayName + " doesn’t have a shown claim now");

			} else if (!text) { // just takes the author id

				dbSetClaim.run(0, msg.author.id, msg.guild.id);
				send(msg,msg.member.displayName + " doesn’t have a shown claim now");
			}
			break;
		case "time":
		{
			const embed = new RichEmbed()
				.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
				.setTitle("Mudae Timer")
				.setDescription(`Next roll reset is in ${nextRestInTimeString(1)}
			Next claim reset is in ${nextRestInTimeString(3)}`)
		;

			send(msg, embed);
			break;
		}
		case "setdaylightsaving":
			if(!text) return send(msg, "This function needs an argument!");

			setSetting.run(text, "halfResetTime"); //TODO:change name to appropriate setting
			send(msg, `DaylightSaving is now ${text}`);
			break;
		default:
			break;
		}
	}
};