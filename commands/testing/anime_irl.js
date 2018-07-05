const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://www.reddit.com/";

module.exports = class AnimeIRLCommand extends Command {
	constructor(client) {
		super(client, {
			name: "anime_irl",
			memberName: "anime_irl",
			group: "fun",
			description: "",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			aliases: ["airl"],
			examples: [], // []required <>optional
			details: "", // long version of description

		});
	}
	async run(msg) {
		const { body } = await snekfech.get(`${api}r/anime_irl/top.json`); 
		// const about = await snekfech.get(`${api}r/anime_irl/about.json`);
		// body.data.children.forEach(e => {
		// 	if (e.kind === "t3") {
		// 		// console.log("test")
		// 		// if (e.data.post_hint == "image") {
		// 		// 	console.log(e);
		// 		// }
		// 	}
		// });
		const embed = new RichEmbed()
			.setFooter(body.data.children[0].data.author)
			.setTitle(body.data.children[0].data.title)
			.setImage(body.data.children[0].data.url);
		msg.channel.send(embed);
	}
};