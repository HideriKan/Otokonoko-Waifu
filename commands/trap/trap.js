const fs = require("fs");
const { workpath , lewdworkpath } = require("./../../config.json");
const { Command } = require("discord.js-commando");
const path = require("path");
const Sqlite = require("better-sqlite3");
const db = new Sqlite(path.join(__dirname, "/../../database.sqlite3"));

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

// db.prepare("DROP TABLE IF EXISTS trapposts").run();
db.prepare(`CREATE TABLE IF NOT EXISTS trapposts (
	trappost_id INTEGER PRIMARY KEY,
	path TEXT NOT NULL,
	is_lewd INTEGER NOT NULL,
	guild_or_user_id NOT NULL)`).run();
const dbInsert = db.prepare("INSERT INTO trapposts VALUES (?, ?, ?, ?)");
/** @returns object of already posted pics */
const getRows = db.prepare("SELECT * FROM trapposts WHERE is_lewd = ?");
const dbreset = db.prepare("DELETE FROM trapposts WHERE guild_or_user_id = ?");

module.exports = class TrapCommand extends Command {
	constructor(client) {
		super(client, {
			name: "trap",
			memberName: "trap",
			group: "trap",
			aliases: ["t", "traps"],
			description: "Posts a Otokonoko picture.",
			examples: ["trap", "trap 5", "trap 1 -lewd"],
			details: "Max. amount of number is `5`. With an `-lewd`, `-l` or `-nsfw` after the number it will post NSFW picture. Will (hopefully) not repost in the same server or user DM's. This command was created with the intetion for my daily Trap posting.",
			throttling: {
				usages: 2,
				duration: 10
			},
			guarded: true,
			argCount: 2,
			args: [
				{
					key: "number",
					prompt: "How many trap(s) would you like me to post?",
					type: "integer",
					default: 1,
					validate: (num) => {
						let thisNum = parseInt(num);
						if(!isNaN(thisNum) && thisNum > 0) {
							return true;
						}
						return "please enter a correct number";

					},
					parse: (num, msg) => {
						if (num > 5) {
							msg.channel.send("The maximum is 5 per command.\nYour request has been reduced to 5");
							return num = 5;
						}
						return parseInt(num);
					}
				},
				{
					key: "lewdargs",
					prompt: "this should be -lewd to post lewds",
					type: "string",
					default: "",
					parse: (lewdargs, msg) => {
						const validArgs = ["-lewd", "-nsfw", "-l"];
						if (validArgs.includes(lewdargs.toLowerCase())) return lewdargs = true;
						msg.channel.send("Unknown arg, Skipping...");
						return lewdargs = false;
					}
				}
			]
		});
	}

	async run(msg, { number, lewdargs }) {
		let allPics, trapdb, imgPath, lewdNum;
		let removed = [];

		if(lewdargs) { // vars for lewd or not lewd
			if (msg.guild ? !msg.channel.nsfw : false) return msg.channel.send("Nyo nsfw in sfw channyews (・`m´・)");
			imgPath = lewdworkpath;
			lewdNum = 1;
			trapdb = getRows.all(1);
		} else if (!lewdargs) {
			imgPath = workpath;
			lewdNum = 0;
			trapdb = getRows.all(0);
		}
		for (let i = 0; i < trapdb.length; i++) { // get already posted images in an array
			if ((msg.guild ? msg.guild.id : msg.author.id) === trapdb[i].guild_or_user_id
				&& lewdNum === trapdb[i].is_lewd)
				removed.push(trapdb[i].path);
		}
		if (!fs.existsSync(imgPath)) return msg.reply("Sowwy, something went wwong ówò (dir not found)");

		allPics = fs.readdirSync(imgPath).filter(pics => pics.includes(".")); // get all images from db
		allPics = allPics.filter(e => !removed.includes(e)); // sorting out already posted images
		const left = await msg.channel.send(`Pics left ${allPics.length - removed.length}`).catch(console.log);
		left.delete(5000).catch(console.log);

		for (let i = 0; i < number; i++) {
			if (!allPics.length) {
				msg.channel.send("No more Images found, reseting the list!");
				dbreset.run(msg.guild ? msg.guild.id : msg.author.id);
				i--;
				continue;
			}

			const fileNr = getRandomInt(allPics.length);

			msg.channel.send({
				files: [{
					attachment: imgPath + "/" + allPics[fileNr]
				}]
			}).catch((e) => console.error(e));

			dbInsert.run(null, allPics[fileNr], lewdNum, msg.guild ? msg.guild.id : msg.author.id);
			allPics.splice(fileNr, 1); // move to db
		}
	}
};