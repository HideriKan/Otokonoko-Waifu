const {Command} = require("discord.js-commando");
const {RichEmbed} = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://api.urbandictionary.com/v0/define";
const trim = (str, max) => (str.length > max) ? `${str.slice(0, max-3)}...` : str;

module.exports = class UrbanCommand extends Command {
	constructor(client) {
		super(client, {
			name: "urban",
			memberName: "urban",
			group: "usefull",
			examples: ["urban trap"], // []required <>optional
			description: "Urban Dictionary as a Command",
			details: "Searches the Urban Dictionary for you input",
			argsCount: 1, // max numbers
			throttling: {
				usages: 1, // in the time frame
				duration: 2 // in seconds
			},
			args: [{
				key: "text",
				prompt: "For what would you like to search in the Urban Dictionary",
				type: "string"
			}]
		});
	}

	async run(msg, {text}) {
		const {body} = await snekfech.get(api).query({
			term: text
		});

		if (body.result_type === "no_results") return msg.channel.send(`No results found for **${text}**`);

		const [answer] = body.list;
		const embed = new RichEmbed()
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			.setTitle(answer.word)
			.setURL(answer.permalink)
			.addField("Definition", trim(answer.definition, 1024))
			.addField("Example", trim(answer.example, 1024))
			.addField("Rating", `${answer.thumbs_up} thumbs up.\n${answer.thumbs_down} thumbs down.`)
			.setFooter(`Tags: ${body.tags.join(", ")}`);

		msg.channel.send(embed);
	}
};