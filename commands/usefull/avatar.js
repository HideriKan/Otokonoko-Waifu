const {	Command } = require("discord.js-commando");
const {	RichEmbed } = require("discord.js");

module.exports = class AvatarCommand extends Command {
	constructor(client) {
		super(client, {
			name: "avatar",
			memberName: "avatar",
			group: "usefull",
			aliases: ["icon", "pfp"],
			description: "Sends the Avatar of the User(s)",
			details: "Get the avatar URL of your own avatar, or the tagged user(s).",
			examples: ["avatar", "avatar @user"],
			throttling: {
				usages: 1,
				duration: 3
			}, // add args
		});
	}
	run(msg) {
		if (!msg.mentions.users.size) {
			const embed = new RichEmbed()
				.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT");

			return msg.channel.send(embed
				.setTitle("Here is your Avatar")
				.setImage(msg.author.avatarURL));
		}

		msg.mentions.users.forEach(user => {
			const embed = new RichEmbed()
				.setTitle(`here is the avatar of ${user.username}`)
				.setImage(user.displayAvatarURL);
			msg.channel.send(embed);
		});
	}
};