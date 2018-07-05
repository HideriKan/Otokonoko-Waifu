const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://api.whatdoestrumpthink.com/api/";

module.exports = class xCommand extends Command {
	constructor(client) {
		super(client, {
			name: "trump",
			memberName: "trump",
			group: "fun",
			description: "Quotes (mabye) trump",
			examples: ["trump", "trump name", "trump @user"], // []required <>optional
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			details: `Without any arguments it sends a random trump quote.
				With a String it will send a personalized quote with the given name.
				With a mentioned user it will send a personalized quote with the users nickname.
				The command will not ping anyone`, // long version of description
		});
	}
	async run(message, args) {
		const embed = new RichEmbed()
			.setColor(message.guild.me.displayColor)
			.setThumbnail("https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_400x400.jpg");

		if (!args.length) {
			const { body } = await snekfech.get(`${api}v1/quotes/random`);
			embed.setTitle("Trump said")
				.setDescription(body.message);

			return message.channel.send(embed).catch(console.error);
		}

		if (!message.mentions.users.size) {
			args = args.charAt(0).toUpperCase() + args.slice(1);
			const { body } = await snekfech.get(`${api}v1/quotes/personalized?q=${args}`);
			embed.setTitle("Trump maybe said")
				.setDescription(body.message);
			return message.channel.send(embed).catch(console.error);
		}

		const usersNickname = message.mentions.members.map(user => user.nickname);
		const { body } = await snekfech.get(`${api}v1/quotes/personalized?q=${usersNickname}`);
		embed.setTitle("Trump maybe said")
			.setDescription(body.message);

		return message.channel.send(embed).catch(console.error);
	}
};