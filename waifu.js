// require consts
// const fs = require("fs");
const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const {oneLine} = require("common-tags");
const {prefix,owner,token,} = require("./config.json");
const path = require("path");
const sqlite = require("sqlite");

const client = new Commando.Client({
	commandPrefix: prefix,
	owner: owner,
	disableEveryone: true
});
client.commands = new Discord.Collection();

client
	.on("ready", () => {
		// let ch_bot_dev = client.channels.get(ch_botID);
		// ch_bot_dev.send("What can I do for you Master?");
		client.user.setActivity("Traps (-help)", {
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
		["testing", "Testing Commands"]
	])

	// Registers all built-in groups, commands, and argument types
	.registerDefaults()

	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, "commands"));

client.login(token);