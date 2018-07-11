const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const { imgurClientID } = require("./../../config.json");

const redditAPI = "https://www.reddit.com";
const imgurAPI = "https://api.imgur.com/3/";
const gfycatAPI = "https://api.gfycat.com/v1/gfycats/";

module.exports = class RedditCommand extends Command {
	constructor(client) {
		super(client, {
			name: "reddit",
			memberName: "reddit",
			group: "fun",
			aliases: ["r/"],
			description: "Posts Images from a subreddit",
			details: "Currently posts **only** images from the subreddit. This bot will not post NSFW in a SFW channel or a spoiler. Can be sorted by `hot`, `top`, `new`, `controversial` or `rising`.",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			examples: ["reddit anime_irl", "reddit animemes top"],
			argsCount: 2, // max numbers
			args: [{
				key: "subreddit",
				prompt: "What subreddit would you like me to post from?",
				type: "string",
			},
			{
				key: "sort", // TODO: error msg
				prompt: "Sort for `hot`, top`, `new`, `controversial`, `rising` or `no sort`",
				type: "string",
				validate: sort => {
					if (sort === "hot" ||
						sort === "top" ||
						sort === "new" ||
						sort === "controversial" ||
						sort === "rising"
					) return true;
				},
				default: ""
			}
			]

		});
	}
	async run(msg, { subreddit, sort }) { //TODO: dont repost // post highest // arg loop x times // include text posts, videos (.webm till it supports it)
		try {
			const { body } = await snekfech.get(`${redditAPI}/r/${subreddit}/${sort}.json`);
			const about = await snekfech.get(`${redditAPI}/r/${subreddit}/about.json`);
			const redditIcon = about.body.data.icon_img;

			// if (subreddit.includes("/comments/")) {
			// 	const data = body.data.children[0].data;
				
			// 	const embed = new RichEmbed()
			// 		.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			// 		.setAuthor(data.subreddit_name_prefixed, redditIcon, redditAPI + "/" + data.subreddit_name_prefixed)
			// 		.setURL(redditAPI + data.permalink)
			// 		.setFooter(`Karma ${data.score} by u/${data.author}`);

			// 	return msg.channel.send(embed);

			// }

			for (let i = 0; i < body.data.children.length; i++) {
				const data = body.data.children[i].data;

				if (about.body.data.over18 && msg.channel.nsfw) return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");
				if (data.over_18 && msg.channel.nsfw) continue;
				if (data.spoiler) continue;
				if (data.url.includes("https://imgur.com/") ||
					data.url.includes("https://gfycat.com/") ||
					data.url.includes(".gifv") ||
					data.url.includes(".jpg") ||
					data.url.includes(".gif") ||
					data.url.includes(".png")
				) {

					const embed = new RichEmbed()
						.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
						.setAuthor(data.subreddit_name_prefixed, redditIcon, redditAPI + "/" + data.subreddit_name_prefixed)
						.setURL(redditAPI + data.permalink)
						.setFooter(`Karma ${data.score} by u/${data.author}`);

					if (data.url.includes("https://imgur.com/")) {
						if (data.url.includes("https://imgur.com/a/")) {
							const hash = data.url.replace("https://imgur.com/a/", "");
							const imgur = await snekfech.get(imgurAPI + "album/" + hash).set("Authorization", `Client-ID ${imgurClientID}`);
							embed.setImage(imgur.body.data.images[0].link)
								.setTitle(data.title + "[Imgur Album]");
						}else {
							const hash = data.url.replace("https://imgur.com/", "");
							const imgur = await snekfech.get(imgurAPI + "image/" + hash).set("Authorization", `Client-ID ${imgurClientID}`);
							embed.setImage(imgur.body.data.link);
						}
					} else if (data.url.includes("https://gfycat.com/")) {
						const hash = data.url.replace("https://gfycat.com/", "");
						const gfycat = await snekfech.get(gfycatAPI + hash);
						embed.setDescription(data.url);
						embed.setImage(gfycat.body.gfyItem.gifUrl);
					} else if (data.url.includes(".gifv")) { //only until discord supports gifv
						embed.setImage(data.url.replace(".gifv", ".gif"));
					} else {
						embed.setImage(data.url)
							.setTitle(data.title);
					}

					return msg.channel.send(embed);
				}
			}
			msg.channel.send("Sowwy nyo Images found to post uwu");

		} catch (err) {
			console.error(err);
			if (err == "Error: 404 Not Found") return msg.reply("404. Subreddit now found please check the spelling");
			if (err == "Error: 403 Forbidden") return msg.reply("403 Forbidden. Dont know why \:shrug:"); // eslint-disable-line
		}
	}
};