const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const { imgurClientID } = require("./../../config.json");

const redditAPI = "https://www.reddit.com";
const imgurAPI = "https://api.imgur.com/3/";
const gfycatAPI = "https://api.gfycat.com/v1/gfycats/";

//big ol if to make sure it doesnt post the wrong thing
function checkSuitability(data) {
	if (data.url.includes("https://imgur.com/") ||
		data.url.includes("https://v.redd.it/") ||
		data.url.includes("https://gfycat.com/") ||
		data.url.includes("https://streamable.com/") ||
		data.url.includes(".gifv") ||
		data.url.includes(".jpg") ||
		data.url.includes(".gif") ||
		data.url.includes(".png")) return true;
}

// big ol if else chain to check the url
async function getEmbedData(data, embed, msg) {
	if (data.url.includes("https://imgur.com/")) {
		if (data.url.includes("https://imgur.com/a/")) {
			const hash = data.url.replace("https://imgur.com/a/", ""); // TODO: test, dont think I need to set a header for this v
			const imgur = await snekfech.get(imgurAPI + "album/" + hash).set("Authorization", `Client-ID ${imgurClientID}`);
			embed
				.setImage(imgur.body.data.images[0].link)
				.setTitle(data.title + "[Imgur Album]");
		} else {
			const hash = data.url.replace("https://imgur.com/", "");
			const imgur = await snekfech.get(imgurAPI + "image/" + hash).set("Authorization", `Client-ID ${imgurClientID}`);
			embed.setImage(imgur.body.data.link);
		}
	} else if (data.url.includes("https://gfycat.com/")) {
		const hash = data.url.replace("https://gfycat.com/", "");
		const gfycat = await snekfech.get(gfycatAPI + hash);
		embed
			.setDescription(data.url)
			.setImage(gfycat.body.gfyItem.gifUrl);
	} else if (data.url.includes(".gifv")) { // untill discord supports gifv
		embed.setImage(data.url.replace(".gifv", ".gif"));
	} else if (data.url.includes("https://streamable.com/")) { // till discord supports to embed videos
		embed.setTitle(data.title);
		msg.channel.send(embed);
		return await msg.channel.send(data.url);
	} else if (data.url.includes("https://v.redd.it/")) {
		embed
			.setDescription("**__This is a reddit hosted video. Go to the video thru the title__**")
			.setImage(data.preview ? data.preview.images[0].source.url : "");
	} else { // this might not be the best 
		embed
			.setImage(data.url)
			.setTitle(data.title);
	}
}

module.exports = class RedditCommand extends Command {
	constructor(client) {
		super(client, {
			name: "reddit",
			memberName: "reddit",
			group: "fun",
			aliases: ["r/", "/r", "/r/"],
			description: "Posts Images from a subreddit",
			details: "Currently posts **only** images from the subreddit. This bot will not post NSFW in a SFW channel or a spoiler. Can be sorted by `hot`, `top`, `new`, `controversial` or `rising`.",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			examples: ["reddit anime_irl", "reddit animemes top", "reddit animemes 8zf79f"],
			argsCount: 3, // max args
			args: [
				{
					key: "subreddit",
					prompt: "What subreddit would you like me to post from?",
					type: "string",
				},
				{
					key: "text", // TODO: add error msg
					prompt: "Sort for `hot`, top`, `new`, `controversial`, `rising` or `no sort`", // update promt; for new args
					type: "string",
					default: ""
				}
			] // wished args are [post x times]

		});
	}
	async run(msg, { subreddit, text }) { //TODO: dont repost // post highest // arg loop/post x times // include text posts(, videos (.webm till it supports it))
		try {
			let isReddit;
			switch (text) { // check if a sort is passed
			case "":
			case "hot":
			case "top":
			case "new":
			case "rising":
			case "controversial":
				isReddit = true;
				break;
			default:
				isReddit = false; // TODO: ask if wanted
			}

			if(isReddit) { // code for when a subreddit is passed
				const { body } = await snekfech.get(`${redditAPI}/r/${subreddit}/${text}.json`);
				const about = await snekfech.get(`${redditAPI}/r/${subreddit}/about.json`);
				const redditIcon = about.body.data.icon_img;

				for (let i = 0; i < body.data.children.length; i++) {
					const data = body.data.children[i].data;

					if (checkSuitability(data)) {
						if (!(!about.body.data.over18 || msg.channel.nsfw)) return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");
						if (!(!data.over_18 || msg.channel.nsfw) || data.spoiler) continue; //hope this works like I want it to be

						let embed = new RichEmbed()
							.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
							.setAuthor(data.subreddit_name_prefixed, redditIcon, redditAPI + "/" + data.subreddit_name_prefixed)
							.setURL(redditAPI + data.permalink)
							.setFooter(`Karma ${data.score} by u/${data.author}`);

						getEmbedData(data, embed, msg);
						return msg.channel.send(embed);
					}
				}
				msg.channel.send("Sowwy nyo Images found to post uwu");

			} else { // code for default which should be a subreddit and a comment TODO: add if not found
				const { body } = await snekfech.get(`${redditAPI}/r/${subreddit}/comments/${text}.json`);
				const data = body[0].data.children[0].data;
				const about = await snekfech.get(`${redditAPI}/r/${subreddit}/about.json`);
				const redditIcon = about.body.data.icon_img;
				
				if (checkSuitability(data))  {
					if (!(!about.body.data.over18 || msg.channel.nsfw)) return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");
					if (!(!data.over_18 || msg.channel.nsfw) || data.spoiler) return; //hope this works like I want it to be

					let embed = new RichEmbed()
						.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
						.setAuthor(data.subreddit_name_prefixed, redditIcon, redditAPI + "/" + data.subreddit_name_prefixed)
						.setTitle(data.title)
						.setURL(redditAPI + data.permalink)
						.setFooter(`Karma ${data.score} by u/${data.author}`);
					
					getEmbedData(data, embed, msg);
					return msg.channel.send(embed);
				}
			}
		} catch (err) {
			console.error(err);
			if (err == "Error: 404 Not Found") return msg.reply("404. Subreddit now found please check the spelling");
			if (err == "Error: 403 Forbidden") return msg.reply("403 Forbidden. Dont know why \:shrug:"); // eslint-disable-line
			return msg.reply("Something went wrong.");
		}
	}
};