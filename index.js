const config = require("../config.json")
const fetch = require("node-fetch")
const fs = require("fs")


function getUUID(username) {
        return fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        .then(data => data.json())
        .then((player) => {
          return player.id
        }).catch(e=>null);
}
async function getPlayer(username){
    const id = await getUUID(username)
return fetch(`https://api.hypixel.net/player?uuid=${id}&key=${config.apiKey}`)
.then(result => result.json())
.then(({player}) => {
    return player
}).catch(e=>null);
};


async function getLinkedDiscord(username){
    const user = await getPlayer(username)
    if(!user || !user.socialMedia || !user.socialMedia.links || !user.socialMedia.links.DISCORD) return null
    return user.socialMedia.links.DISCORD
}


const Discord = require('discord.js')

const client = new Discord.Client();


client.on("ready", () =>console.log(`${client.user.tag} is online!`))

client.on("message", async message => {
  if(!message.guild || message.guild.id !== config.targetGuild) return;
    const args = message.content.slice(config.prefix.length).split(/ +/g)
    const command = args.shift()
    if(command === "verify"){
      const username = args[0]
      
      const embed_verified = new Discord.MessageEmbed()
        .setColor('#00c914')
        .setTitle('Verification successful ✅')
        .addField('Matching Discord tag found', 'You gained the Verified role and chat access', false)
        .addField('\u200B', '\u200B', false)
        .addField('Nickname changed to:', username, false)
        .setTimestamp()

      const embed_failed = new Discord.MessageEmbed()
        .setColor('#c90000')
        .setTitle('Verification failed  ❌')
        .addField('Looks like your account is not linked or is out-dated', 'Here is a **[guide](https://www.youtube.com/watch?v=gqUPbkxxKLI&feature=emb_logo)** on how to link your account on Hypixel', true)
        .addField('\u200B', '\u200B', false)
        .attachFiles(['./images/guide.png'])
        .setImage('attachment://guide.png')
        .setTimestamp()

      

      if(!username) return message.reply("You need to say your minecraft username.")
      const linkedAccount = await getLinkedDiscord(username)
      if(linkedAccount !== message.author.tag){
          message.member.roles.remove([config.verifiedRole])
          return message.channel.send(embed_failed)
      }
      message.member.setNickname(username).catch(console.log)
      message.member.roles.add([config.verifiedRole]).then(()=>{
          message.channel.send(embed_verified)
      }).catch(e=>{
        console.log(e)
        message.reply(`An error occured: \n\`${e}\``)
      })
    }
})




// gets token from token.txt file and logs in with it.
const token = fs.readFileSync("../token.txt").toString()
client.login(token)
