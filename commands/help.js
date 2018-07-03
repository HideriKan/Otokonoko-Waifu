const {prefix} = require("../config.json");

module.exports = {
	name: "help",
	aliases: ["commands", "cmds", "all", "h"],
	description: "List all commands or info about a specific command.",
	usage: "<command name> | -b for beta commands",
	cooldown: 2,
	execute(message, args) {
		let nonBeta;
		const data = [];
		const {
			commands
		} = message.client;
		if (args[0] !== "-b") nonBeta = commands.filter(e => !e.beta);

		if (!args.length || args[0] === "-b") {
			if (args[0] === "-b") {
				data.push("Here's a list of **all** my commands:`[]required <>optional` ```");
				data.push(commands.map(command => command.name).join("\n"));
			} else {
				data.push("Here's a list of all my commands:`[]required <>optional` ```");
				data.push(nonBeta.map(command => command.name).join("\n"));
			}
			data.push("```");
			data.push(`\nYou can send \`${prefix}help <command name>\` to get more info on a specific command!`);

			return message.channel.send(data, {
					split: true
				})
				.catch(e => console.error(e));
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply("that's not a valid command!");
		}
		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(", ")}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 1} second(s)`);
		message.channel.send(data, {
			split: true
		});
	},
};