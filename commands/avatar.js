const Discord = require("discord.js");

module.exports = {
	name: "avatar",
	aliases: ["icon", "pfp"],
	description: "Get the avatar URL of your own avatar, or the tagged user(s).",
	usage: "<@user(s)>",
	cooldown: 3,
	execute(message) {
		const embed = new Discord.RichEmbed()
			.setColor(message.guild.me.displayColor);

		if (!message.mentions.users.size) {
			return message.channel.send(embed
				.setTitle("Your Avatar")
				.setImage(message.author.avatarURL));
		}

		const user = message.mentions.users.first();
		embed.setTitle(user.username)
			.setImage(user.displayAvatarURL);

		message.channel.send(embed);
	},
};