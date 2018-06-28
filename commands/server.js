module.exports = {
	name: "server",
	aliases: [""],
	description: "Display info about this server.",
	usage: "",
	args: false,
	guildOnly: true,
	cooldown: 5,
	execute(message) {
		message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
	},
};