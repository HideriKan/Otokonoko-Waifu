// require consts
// const fs = require("fs");
const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const {
	oneLine
} = require("common-tags");
const {
	prefix,
	owner,
	token,
	beta_serverID
} = require("./config.json");
const path = require("path");
const sqlite = require("sqlite");

const client = new Commando.Client({
	commandPrefix: prefix,
	owner: owner,
	disableEveryone: true
});
// const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

// getting all commads from the command directory
// const commandFiles = fs.readdirSync("./commands").filter(fileEnding => fileEnding.endsWith(".js"));
// for (const fileEnding of commandFiles) {
// 	const command = require(`./commands/${fileEnding}`);
// 	client.commands.set(command.name, command);
// }

client
	.on("ready", () => {
		// let ch_bot_dev = client.channels.get(ch_botID);
		// ch_bot_dev.send("What can I do for you Master?");
		client.user.setActivity("Traps (-help)", {
			type: "WATCHING"
		});
	})
	// .on("message", msg => {
	// 	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	// 	const args = msg.content.slice(prefix.length).split(/ +/);
	// 	const commandName = args.shift().toLowerCase();

	// 	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// 	// checks if the command even exists
	// 	if (!command) return msg.reply("Invalid command");

	// 	// for server only commands
	// 	if (msg.channel.type !== "text" && command.guildOnly) return msg.reply("I can't execute that command inside DMs!");

	// 	// for beta commands
	// 	if (msg.channel.type === "text" && command.beta && !(msg.guild.id === beta_serverID)) return msg.reply("Sorry, this is a Beta command and not usable on this Server");

	// 	// if the user provided arguments if needed
	// 	if (command.args && !args.length) return msg.reply(`You didn't provide any arguments! \n**Usage:** ${command.usage}`); //TODO: test this

	// 	// cooldown
	// 	if (!cooldowns.has(command.name)) {
	// 		cooldowns.set(command.name, new Discord.Collection());
	// 	}

	// 	const now = Date.now();
	// 	const timestamps = cooldowns.get(command.name);
	// 	const cooldownAmount = (command.cooldown || 1) * 1000;
	// 	let cdType;

	// 	if (command.name === "trap") {
	// 		cdType = msg.guild.id;
	// 	} else {
	// 		cdType = msg.author.id;
	// 	}

	// 	if (!timestamps.has(cdType)) {
	// 		timestamps.set(cdType, now);
	// 		setTimeout(() => timestamps.delete(cdType), cooldownAmount);
	// 	} else {
	// 		const expirationTime = timestamps.get(cdType) + cooldownAmount;

	// 		if (now < expirationTime) {
	// 			const timeLeft = (expirationTime - now) / 1000;
	// 			return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`);
	// 		}

	// 		timestamps.set(cdType, now);
	// 		setTimeout(() => timestamps.delete(cdType), cooldownAmount);
	// 	}

	// 	// the command execute
	// 	try {
	// 		command.execute(msg, args);
	// 	} catch (error) {
	// 		console.error(error);
	// 		msg.reply("there was an error trying to execute that command! <@146493901803487233> fix it!");
	// 	}

	// })
	.on("error", console.error)
	.on("warn", console.warn)
	// .on("commandError", (cmd, err) => {
	// 	if (err instanceof commando.FriendlyError) return;
	// 	console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	// })
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
		["fun", "Fun commands"],
		["trap", "Trap commands"],
		["usefull", "Some other usefull commands"],
		["testing", "Testing Commands"]
	])

	// Registers all built-in groups, commands, and argument types
	.registerDefaults()

	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, "commands"));

client.login(token);