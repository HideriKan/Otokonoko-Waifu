module.exports = {
	name: "server",
	aliases: ["s"],
	description: "Display info about this server.",
	usage: "",
	guildOnly: true,
	cooldown: 2,
	execute(message) {
		message.channel.send(`**Server name**: ${message.guild.name}\n**Total members**: ${message.guild.memberCount}`);
	},
};