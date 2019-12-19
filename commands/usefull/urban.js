const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const trim = (str, max) => (str.length > max) ? `${str.slice(0, max-3)}...` : str;

module.exports = class UrbanCommand extends Command {
	constructor(client) {
		super(client, {
			name: "urban",
			memberName: "urban",
			group: "usefull",
			examples: ["urban brb"],
			description: "Urban Dictionary as a Command",
			details: "Searches the Urban Dictionary for you input",
			argsCount: 1,
			throttling: {
				usages: 1,
				duration: 3
			},
			args: [{
				key: "text",
				prompt: "For what would you like to search in the Urban Dictionary",
				type: "string"
			}]
		});
	}

	async run(msg, {text}) {
		const api = new URL("https://api.urbandictionary.com/v0/define");
		api.searchParams.append("term", text);

		const res = await fetch(api)
			.then(res => res.json())
			.catch(err => (console.log(err)));

		if (res.result_type === "no_results") return msg.channel.send(`No results found for **${text}**`);

		const [answer] = res.list;
		const embed = new MessageEmbed()
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			.setTitle(answer.word)
			.setURL(answer.permalink)
			.setTimestamp(answer.written_on)
			.addField("Definition", trim(answer.definition, 1024))
			.addField("Example", trim(answer.example, 1024))
			.addField("Rating", `${answer.thumbs_up} thumbs up.\n${answer.thumbs_down} thumbs down.`);
			// .setFooter(`Tags: ${res.tags.join(", ")}`);

		msg.channel.send(embed);
	}
};