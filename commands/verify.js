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

async function getGuild(username){
  const id = await getUUID(username);
  return fetch(`https://api.hypixel.net/findGuild?byUuid=${id}&key=${config.apiKey}`)
.then(result => result.json())
.then(({guild}) => {
    return guild
}).catch(e=>null);
};

async function guildInfo(guildID){
  return fetch(`https://api.hypixel.net/guild?key=${config.apiKey}&id=${guildID}`)
  .then(result => result.json())
  .then(({guild}) => {
    return guild
  }).catch(e=>console.log(e));
}


async function getLinkedDiscord(username){
    const user = await getPlayer(username)
    if(!user || !user.socialMedia || !user.socialMedia.links || !user.socialMedia.links.DISCORD) return null
    return user.socialMedia.links.DISCORD
}

const Discord = require('discord.js');
module.exports = {
    name: 'verify',
    description: 'account verification',
    cooldown: 7,
    async execute(message, args){
        const username = args[0]
        const linkedAccount = await getLinkedDiscord(username)
        const playerUUID = await getUUID(username);
        const authorID = message.author.id;
        const player = await getPlayer(username);
        const bedwarsLevel = player.achievements.bedwars_level;
        const networkLevel = player.networkExp;
        const embed_verified = new Discord.MessageEmbed()
        
          .setColor('#00c914')
          .setAuthor('✅Successfuly verified')
          .addField('Nickname changed to:', `${player.displayname}`, false)
          //.setThumbnail(`https://crafatar.com/avatars/${playerUUID}`)
          .setThumbnail(`https://visage.surgeplay.com/full/${playerUUID}?size=240`)
          .setTimestamp()
          .setFooter('Guarding the server\'s gate')
        
          const embed_failed = new Discord.MessageEmbed()
          .setColor('#fc0303')
          .setAuthor('❌Failed to verify')
          .addField(`Update your tag from \`${linkedAccount}\n\` to \`${message.author.tag}\n\``, 'Here is a **[guide](https://www.youtube.com/watch?v=gqUPbkxxKLI&feature=emb_logo)** on how to link your account on Hypixel', false)
          .setFooter('A self-coded bot')
          //.addField('Looks like your account is not linked or is out-dated', 'Here is a **[guide](https://www.youtube.com/watch?v=gqUPbkxxKLI&feature=emb_logo)** on how to link your account on Hypixel', true)
          .attachFiles(['./images/guide.png'])
          .setImage('attachment://guide.png')
          .setTimestamp()
          .setFooter('Guarding the server\'s gate')
  
          const embed_failed_none = new Discord.MessageEmbed()
          .setColor('#fc0303')
          .setAuthor('❌Failed to verify')
          .addField('You have not linked your account. Did you enter the correct IGN?', 'Here is a **[guide](https://www.youtube.com/watch?v=gqUPbkxxKLI&feature=emb_logo)** on how to link your account on Hypixel', true)
          .attachFiles(['./images/guide.png'])
          .setImage('attachment://guide.png')
          .setTimestamp()
          .setFooter('Guarding the server\'s gate')
          //const memberRoleObject = message.guild.roles.cache.find(role => role.name == "Guild Member👊");
  
          const embed_member_left = new Discord.MessageEmbed()
          .setColor('#c90000')
          .addField('You have left the guild', `Your <@&686070737194450995> role was taken away!`, false)
  
       
  
        if(!username) return message.reply("You need to say your minecraft username.")
        //linkedAccount was here
              
       if(linkedAccount){ // If the linked discord tag is not the same as the user that ran it
          if(linkedAccount !== message.author.tag){
                 message.member.roles.remove(config.verifiedRole)  
                 return message.reply(embed_failed)
                  }
        } else {
                 message.member.roles.remove(config.verifiedRole)
                 return message.reply(embed_failed_none)
        }
                  
        let isInGuild = false;
        const guildID = await getGuild(username);
        const guild = await guildInfo(guildID).catch(e=>null);
        let guildName;
              
        
  
        if(guildID){
          // Checks if it is in any guild
          guildName = guild.name;
          embed_verified.setTitle('Guild found: ' + guildName)
          setTimeout(function(){message.member.roles.remove(config.memberRole)}, 110);
        }else if(!guildID && !message.member.roles.cache.has(config.memberRole)){
          embed_verified.setTitle('No guild found')
        }else if(guildID !== config.hypixelGuild && message.member.roles.cache.has(config.memberRole)){
          // User is not in guild, but has the member role
          message.channel.send(embed_member_left)
          setTimeout(function(){message.member.roles.remove(config.memberRole)}, 110);
        }
        
  
        if(guildID && guildID === config.hypixelGuild){
          // This will run if  the user is in the guild
          isInGuild = true
        }else if(guildID){
          // This will run if the user is not in the guild, but is in any guild.
          
        }
        message.member.setNickname(player.displayname).catch(console.log)
        message.member.roles.add([config.verifiedRole]).then(()=>{
          if(!isInGuild){
          message.channel.send(embed_verified)
          
          } else {
              // If it is in the guild, then add the member role
              var networkLevel = (Math.sqrt(player.networkExp + 15312.5) - 125/Math.sqrt(2))/(25*Math.sqrt(2));
              embed_verified.addField('Member of Deference', `Given <@&686070737194450995> role`, false)
              message.channel.send(embed_verified)
              message.member.roles.add(config.memberRole).catch(e=>{
                console.log(e)
                message.reply(`An error occured: \n\`${e}\``)
              }) 
            } 
        }).catch(e=>{
          console.log(e)
          message.reply(`An error occured: \n\`${e}\``)
        })
    },
}