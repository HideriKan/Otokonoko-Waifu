const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://api.whatdoestrumpthink.com/api/";

module.exports = class TrumpCommand extends Command {
	constructor(client) {
		super(client, {
			name: "trump",
			memberName: "trump",
			group: "fun",
			description: "(mabye) Quotes trump",
			examples: ["trump", "trump name", "trump @user"], // []required <>optional
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			details: "Without any arguments it sends a random trump quote. With a `name` it will send a personalized quote with the given `name`. With a `@user` it will send a personalized quote with the `users nickname`. The command will not ping the user",
		}); //TODO: add args
	}
	async run(msg, args) { //TODO: (mabye) change .setTumbnaul img to .setAuthor
		const embed = new RichEmbed()
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			.setThumbnail("https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_400x400.jpg");

		if (!args.length) {
			const { body } = await snekfech.get(`${api}v1/quotes/random`);
			embed.setTitle("Trump said")
				.setDescription(body.message);

			return msg.channel.send(embed).catch(console.error);
		}

		if (!msg.mentions.users.size) {
			args = args.charAt(0).toUpperCase() + args.slice(1);
			const { body } = await snekfech.get(`${api}v1/quotes/personalized?q=${args}`);
			embed.setTitle("Trump maybe said")
				.setDescription(body.message);
			return msg.channel.send(embed).catch(console.error);
		}

		const usersNickname = msg.mentions.members.map(user => user.nickname);
		const { body } = await snekfech.get(`${api}v1/quotes/personalized?q=${usersNickname}`);
		embed.setTitle("Trump maybe said")
			.setDescription(body.message);

		return msg.channel.send(embed).catch(console.error);
	}
};