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
			details: "Get the avatar URL of your own avatar, or the tagged user(s).", // long version of description
			examples: ["avatar", "avatar @user"], // []required <>optional
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
		});
	}
	run(msg) {
		if (!msg.mentions.users.size) {
			const embed = new RichEmbed()
				.setColor(msg.guild.me.displayColor);

			return msg.channel.send(embed
				.setTitle("Your Avatar")
				.setImage(msg.author.avatarURL));
		}

		msg.mentions.users.forEach(user => {
			const embed = new RichEmbed()
				.setTitle(`Avatar of ${user.username}`)
				.setImage(user.displayAvatarURL);
			msg.channel.send(embed);
		});
	}
};