const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { oneLine } = require("common-tags");
const {
	prefix,
	owner,
	token,
	// beta_token
} = require("./config.json");
const path = require("path");
const sqlite = require("sqlite");
// const reaction = new Discord.ReactionEmoji();

const client = new Commando.Client({
	commandPrefix: prefix,
	owner: owner,
	// invite: "<https://discord.gg/uZAPmRV>",
	disableEveryone: true,
	unknownCommandResponse: false
});
client.commands = new Discord.Collection();

client
	.on("message", async msg => {
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
	})
	.on("ready", () => {
		client.user.setActivity("Traps (,,help)", {
			type: "WATCHING"
		});
	})
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
	.on("disconnect", () => {
		console.warn("Disconnected!");
	})
	.on("reconnecting", () => {
		console.warn("Reconnecting...");
	});

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

process.on("unhandledRejection", (reason, p) => {
	console.log("Unhandled Rejection at: ", p, "reason: ", reason);
});

client.login(token);
// client.login(beta_token);