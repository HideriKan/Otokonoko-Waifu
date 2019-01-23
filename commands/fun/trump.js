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
			description: "(maybe) Quotes trump",
			examples: ["trump", "trump name", "trump @user"],
			throttling: {
				usages: 1,
				duration: 3
			},
			details: "Without any arguments it sends a random trump quote. With a `name` it will send a personalized quote with the given `name`. With a `@user` it will send a personalized quote with the `users nickname`. The command will not ping the user",
			args:[{
				key: "name",
				prompt: "",
				type: "string",
				default: ""
			}],
		});
	}
	async run(msg, {name}) {
		const embed = new RichEmbed()
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT");

		if (!name.length) {
			const { body } = await snekfech.get(`${api}v1/quotes/random`);
			embed.setAuthor("Trump said", "https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_400x400.jpg")
				.setDescription(body.message);

			return msg.channel.send(embed).catch(console.error);
		}

		if (!msg.mentions.users.size) {
			name = name.charAt(0).toUpperCase() + name.slice(1);
			const { body } = await snekfech.get(`${api}v1/quotes/personalized?q=${name}`);
			embed.setAuthor("Trump maybe said", "https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_400x400.jpg")
				.setDescription(body.message);
			return msg.channel.send(embed).catch(console.error);
		}

		const usersNickname = msg.mentions.members.map(user => user.nickname);
		const { body } = await snekfech.get(`${api}v1/quotes/personalized?q=${usersNickname}`);
		embed.setAuthor("Trump maybe said", "https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_400x400.jpg")
			.setDescription(body.message);

		return msg.channel.send(embed).catch(console.error);
	}
};