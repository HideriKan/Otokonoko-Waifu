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
const checkdb = new sqlite3(path.join(__dirname, "./commands/dev/database.sqlite3"));

const client = new Commando.Client({
	commandPrefix: prefix,
	owner: owner,
	// invite: "<https://discord.gg/uZAPmRV>",
	disableEveryone: true,
	unknownCommandResponse: false 
});

client
	.on("message", async msg => {
		//mude bot claim check
		if (msg.author.id === "432610292342587392" && msg.content.includes("are now married!")) {
			let married = msg.content.match(/\*\*[^()]+\*\* and/gi);
			let marriedUserName = married[0].substring(2, married[0].length - 6);
			let user = msg.guild.members.find(m => m.user.username == marriedUserName);
			
			checkdb.prepare("UPDATE mudaeusers SET claimed = 0 WHERE id = ?").run(user.id);
			console.log(`${marriedUserName} got married`);
			msg.react("💖");
		}

		// hard couter to a bot :smug:
		if (msg.author.id === "462878456598888449" && msg.content === "kms") return msg.channel.send("do it");
		if (msg.author.id === "462878456598888449" && msg.content === "do it") return msg.channel.send("no u");

		// owo reatction cuz we both love traps
		if (msg.content.toLocaleLowerCase().includes("trap")) {
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

		//some stuid way to notify me
		if (msg.channel.id == ("315509598440128513")) {
			if (msg.content.startsWith("$h") ||
				msg.content.startsWith("$w") ||
				msg.content.startsWith("$m")) {
				if (msg.content.startsWith("$mm")) return;
				if (msg.content.startsWith("$mu")) return;
				
				const privatech = client.channels.get("296984061287596032");
				privatech.send(`<#${msg.channel.id}>roll!`)
					.then(msg => msg.delete(10000))
					.catch(console.err);
			}
		}
	})
	.on("guildCreate", ch => ch.send("What can I do for you Master?"))//server join
	//.on("guildMemberAdd", user => )  // whenever someone join a guild
	//.on("guildMeberRemove", user => ) // whenever someone leave a guild
	.on("guildUnavailable", guild => console.log(`guild:${guild.name} unavailable`))
	.on("ready", () => {
		// time trigger for mudaeusers resets
		function getNextResetDateInMs() {
			let now = new Date();
			let UTCNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			let hour = now.getUTCHours();

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
			console.log(UTCNow);
			console.log(date);
			console.log(date - UTCNow);
			return date - UTCNow;
		}

		function resetTable() {
			client.channels.get("311850727809089536").send("List reset");
			checkdb.prepare("UPDATE mudaeusers SET claimed = 1 WHERE claimed = 0").run();	
		}

		function interval() {
			resetTable();
			setInterval(resetTable, 3/*h*/ * 60/*min*/ * 60/*s*/ * 1000/*ms*/);
		}

		setTimeout(interval, getNextResetDateInMs());
		//end of mudae reset

		console.log("Ready!");
		client.user.setActivity("Traps (,,help)", {
			type: "WATCHING"
		});
	})
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
	.on("reconnecting", () => console.warn("Reconnecting..."));

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