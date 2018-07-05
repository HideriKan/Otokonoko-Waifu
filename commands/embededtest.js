const Discord = require("discord.js");
const embed = new Discord.RichEmbed()
	.addField("Field", "more field",true)
	.setURL("https://i.redd.it/p9dn9wu9iv711.png")
	// .addBlankField(true)
	.setDescription("this.description")
	.setFooter("footer")
	.setImage("https://i.redd.it/p9dn9wu9iv711.png")
	.setThumbnail("https://i.redd.it/p9dn9wu9iv711.png")
	.setTitle("Title")
	.setAuthor("keinschimer")
;
module.exports = {
	name: "",
	aliases: ["e"],
	description: "testing",
	execute(msg) {
		msg.channel.send(
			embed
				.setColor(msg.guild.me.displayColor));
	}
};