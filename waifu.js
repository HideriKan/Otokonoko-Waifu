const fs = require("fs");
const Discord = require("discord.js");
const {
	prefix,
	token
} = require("./config.json");

const cooldowns = new Discord.Collection();
const client = new Discord.Client();
client.commands = new Discord.Collection();
let ch_bot_dev;

// getting all commads from the command dir
const commandFiles = fs.readdirSync("./commands").filter(fileEnding => fileEnding.endsWith(".js"));
for (const fileEnding of commandFiles) {
	const command = require(`./commands/${fileEnding}`);
	client.commands.set(command.name, command);
}

client.on("ready", () => {
	ch_bot_dev = client.channels.get("452983445380005888");
	ch_bot_dev.send("What can I do for you Master?");
	client.user.setActivity("Traps", {
		type: "WATCHING"
	});
});

// client.on("message", msg => {
// 	if(msg.content === "no") msg.channel.send("You Didnt");
// });

client.on("message", msg => {
	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const args = msg.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	//checks if the command is only usable in a Server
	if (command.guildOnly && msg.channel.type !== "text") {
		return msg.reply("I can't execute that command inside DMs!");
	}

	//checks if the user provided the correct arguments
	if (command.args && !args.length) {
		return msg.channel.send(`You didn't provide any arguments, ${msg.author}!`);
	}

	//cheks the cooldown
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 1) * 1000;

	if (!timestamps.has(msg.author.id)) {
		timestamps.set(msg.author.id, now);
		setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
	} else {
		const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`);
		}

		timestamps.set(msg.author.id, now);
		setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
	}

	try {
		command.execute(msg, args);
	} catch (error) {
		console.error(error);
		msg.reply("there was an error trying to execute that command!");
	}

});

client.login(token);