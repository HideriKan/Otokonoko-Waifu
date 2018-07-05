const Discord = require("discord.js");

module.exports = {
	name: "avatar",
	aliases: ["icon", "pfp"],
	description: "Get the avatar URL of your own avatar, or the tagged user(s).",
	usage: "<@user(s)>",
	cooldown: 3,
	execute(message) {
		if (!message.mentions.users.size) {
			const embed = new Discord.RichEmbed()
				.setColor(message.guild.me.displayColor);

			return message.channel.send(embed
				.setTitle("Your Avatar")
				.setImage(message.author.avatarURL));
		}

		message.mentions.users.forEach(user => {
			const embed = new Discord.RichEmbed()
				.setColor(message.guild.me.displayColor)
				.setTitle(`Avatar of ${user.username}`)
				.setImage(user.displayAvatarURL);
			message.channel.send(embed);
		});
	},
};