const Discord = require('discord.js');
const client = new Discord.Client();
var modMailChannel = null
var publicShameChannel = null

client.on('ready', () => {
	console.log('These boots were made for bootin`');
});

const filter = (reaction, user) => {
	return ['👀', '🚫'].includes(reaction.emoji.name) && user.id !== client.user.id;
};

client.on('message', message => {
	if (message.author != client.user) { //Stop the bot replying to itself, we dont want it going crazy


		if (message.channel.type === 'dm') { //If the message is a DM, handle the complaint
			if (modMailChannel === null) { //Bot hasn't been started yet
				message.channel.send("This bot is temporarily down for maintenance")
			} else {
				var links = []

				if (message.attachments.size) {

					message.attachments.forEach(element => {
						links.push(element.url)
					});

					const embed = new Discord.RichEmbed()
						.setTitle('Incoming report from ' + message.author.tag)
						.setColor('RANDOM')
						.setDescription('Time for judgement')
						.attachFiles(links)

					// Send the embed to the modmail channel
					modMailChannel.send(embed)
						.then(function (message) {
							message.react('👀')
							message.react('🚫')

							message.awaitReactions(filter, { max: 1 }).then(collected => {
								var reaction = collected.first()
								if (reaction.emoji.name === '👀') {
									if (publicShameChannel === null) {
										modMailChannel.send("No public shame channel setup yet, start it with b!public in the desired channel")
									} else {
										pics = []
										message.attachments.forEach(element => {
											pics.push(element.url)
										});
										publicShameChannel.send(new Discord.RichEmbed().setTitle('Checkout this fool who didn\'t respect tags').setColor('RANDOM').attachFiles(pics)).then(() => message.delete())
									}
								} else if (reaction.emoji.name === '🚫') {
									message.delete();
								} else {
									modMailChannel.send('This is embarrassing, you should never be able to see this')
								}
							}).catch()
						})
				}
				message.channel.send("Your report has successfully been recieved")
			}
			return
		}

		found = message.member.roles.find(function (role) { //Find the role with the correct name
			return role.name === 'Co-Owners' || role.name === 'School Board'
		});

		if ((message.guild !== null) && (message.content.startsWith('b!'))) {
			if (found) {
				switch (message.content.toUpperCase()) {
					case 'B!START':
						modMailChannel = message.channel
						message.channel.send("Starting bot in this, all complaints will come here. To turn off, use command bstop")
						break;
					case 'B!STOP':
						if (modMailChannel === null) {
							message.channel.send("The bot isn't running yet silly")
						} else if (message.channel === modMailChannel) {
							modMailChannel = null
							publicShameChannel = null
							message.channel.send("Bot disabled, to restart use command bstart")
						}
						break;
					case 'B!PUBLIC':
						publicShameChannel = message.channel
						message.channel.send('This channel is now the public shaming channel, all mod approved messages will be sent here')
						break
					default:
						message.channel.send("Unknown command, use either bstart or bstop")
						break;
				}

				if (message.content.indexOf('b!prune') == 0) {
					message.channel.bulkDelete(parseInt(message.content.slice(8)))
				}
			} else {
				message.channel.send("You dont have required role")
			}
		}/**/
	}

})

client.login(process.env.BOT_TOKEN);