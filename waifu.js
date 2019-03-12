const Commando = require("discord.js-commando");
const { oneLine } = require("common-tags");
const {
	prefix,
	owner,
	token,
	// beta_token
} = require("./config.json");
const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("better-sqlite3");
const maindb = new sqlite3(path.join(__dirname, "database.sqlite3"));
const getMuadeSettings = maindb.prepare("SELECT * FROM mudaesettings");

const client = new Commando.Client({
	commandPrefix: prefix,
	owner: owner,
	// invite: "<https://discord.gg/uZAPmRV>",
	disableEveryone: true,
	unknownCommandResponse: false
});
let isTimerNotSet = true;

function mudaeResetInterval() {
	client.channels.get("315509598440128513").send("List reset <@&472769044320223233>");
	maindb.prepare("UPDATE mudaeusers SET claimed = 1 WHERE claimed = 0").run();
	setTimeout(mudaeResetInterval, getNextResetDateInMs());
	// interval(resetTable, 3/*h*/ * 60/*min*/ * 60/*s*/ * 1000/*ms*/);
}

async function muedaeObserver(msg) {
	if (msg.content.includes(" are now married!")) { // married
		let member;
		if (msg.mentions.members.size) {
			if(!msg.content.includes("(Event)")) {
				member = msg.mentions.members.first();
			}
		} else {
			let married = msg.content.match(/\*\*[^()]+\*\* and/gi);
			let marriedUserName = married[0].substring(2, married[0].length - 6);
			member = msg.guild.members.find(m => m.user.username === marriedUserName);

		}

		if (member) {
			maindb.prepare("UPDATE mudaeusers SET claimed = 0 WHERE id = ? AND guild_id = ?").run(member.id, msg.guild.id);
			msg.react("💖");
		}
	} else if (msg.content.includes(" was given to ")) { // give
		let user = msg.mentions.users.first();

		maindb.prepare("UPDATE mudaeusers SET claimed = 0 WHERE id = ? AND guild_id = ?").run(user.id, msg.guild.id);
		msg.react(":blobaww:357967083960795137");
	}
}

async function owoReact(msg) {
	if (msg.guild) { // seaches the guilds emotes for a owo
		const emote = msg.guild.emojis.find(emote => {
			return emote.name.toLocaleLowerCase().includes("owo");
		});
		if (emote) {
			return msg.react(emote);
		}
	}
	// fallback for then no owo emote is in the guild
	await msg.react("🇴").catch(console.error);
	await msg.react("🇼").catch(console.error);
	await msg.react("🅾").catch(console.error);
}

function getNextResetDateInMs() {
	let now = new Date();
	let UTCNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	let hour = now.getUTCHours();

	let mSettings = getMuadeSettings.all();

	if (mSettings[0].setting === "halfResetTime" && mSettings[0].bool === 1) { //this is the is DaylightSaving setting
		switch (hour % 3) {
		case 0:
			hour += 1;
			break;
		case 1:
			if (now.getUTCMinutes() < 4) break;
			hour += 3;
			break;
		case 2:
			hour += 2;
			break;
		}
	} else {
		switch (hour % 3) {
		case 0:
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
	let time = date - UTCNow;

	return time;
}


client
	.on("message", msg => {
		//mude bot claim check
		switch (msg.author.id) {
		case "432610292342587392": //Mudae
		case "479206206725160960": //Mudamaid
		case "488711695640821760": //Mudamaid2
		// case "146493901803487233":
			muedaeObserver(msg);
			break;
		}

		// hard couter to a bot :smug:
		if (msg.author.id === "462878456598888449" && msg.content === "kms") return msg.channel.send("do it");
		if (msg.author.id === "462878456598888449" && msg.content === "do it") return msg.channel.send("no u");

		// owo reatction cuz we both love traps
		if (msg.content.toLocaleLowerCase().includes("trap")) return owoReact(msg);
	})
	.on("ready", () => {
		if (isTimerNotSet) { // time trigger for mudaeusers resets
			setTimeout(mudaeResetInterval, getNextResetDateInMs());
			isTimerNotSet = false;
		} //end of mudae reset

		console.log("Ready!");
		client.user.setActivity("Traps (,,help)", {type: "WATCHING"});
	})
	.on("guildCreate", ch => ch.send("What can I do for you Master?"))//server join
	//.on("guildMemberAdd", user => )  // whenever someone join a guild
	//.on("guildMeberRemove", user => ) // whenever someone leave a guild
	.on("guildUnavailable", guild => console.log(`guild:${guild.name} unavailable`))
	.on("degub", console.log)
	.on("error", console.error)
	.on("warn", console.warn)
	.on("commandError", (cmd, err) => {
		if (err instanceof Commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on("commandBlocked", (msg, reason) => {
		console.log(oneLine `
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ""}
			blocked; ${reason}
		`);
	})
	.on("commandPrefixChange", (guild, prefix) => {
		console.log(oneLine `
			Prefix ${prefix === "" ? "removed" : `changed to ${prefix || "the default"}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
	})
	.on("commandStatusChange", (guild, command, enabled) => {
		console.log(oneLine `
			Command ${command.groupID}:${command.memberName}
			${enabled ? "enabled" : "disabled"}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
	})
	.on("groupStatusChange", (guild, group, enabled) => {
		console.log(oneLine `
			Group ${group.id}
			${enabled ? "enabled" : "disabled"}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
	})
	.on("disconnect", () => console.warn("Disconnected!"))
	.on("reconnecting", () => console.warn("Reconnecting..."))
	.on("rateLimit", info =>
		console.log(
			`Limit: ${info.requestLimit}`,
			`Time: ${info.timeDifference}`,
			`Method: ${info.method}`,
			`Path: ${info.path}`
		));

client.setProvider(
	sqlite.open(path.join(__dirname, "database.sqlite3")).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

client.registry
	// Registers your custom command groups
	.registerGroups([
		["trap", "The Best Commands", true],
		["usefull", "Usefull commands that are usefull"],
		["fun", "Fun/Stupid commands"],
		["dev", "in-Dev/Dev Commands"]
	])
	// Registers all built-in groups, commands, and argument types
	.registerDefaults()
	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, "commands"));

client.login(token);
// client.login(beta_token);

process.on("unhandledRejection", (reason, p) => {
	console.log("Unhandled Rejection at: ", p, "reason: ", reason);
});