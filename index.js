const config = require("./config.json")
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
}

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

function removeMemberRole(authorID){
    const guild = client.guilds.cache.get(config.targetGuild);   // copy the id of the server your bot is in and paste it in place of guild-ID.
    const role = guild.roles.cache.get(config.memberRole);  // here we are getting the role object using the id of that role.
    const member = guild.members.fetch(authorID); // here we are getting the member object using the id of that member. This is the member we will add the role to.
    
    member.roles.remove(role);   // here we just added the role to the member we got.
}


const Discord = require('discord.js')

const client = new Discord.Client();

client.on("ready", () =>console.log(`${client.user.tag} is online!`))

client.on("message", async message => {
  //if(message.author.bot) return;
  if(!message.guild || message.guild.id !== config.targetGuild) return;
    const args = message.content.slice(config.prefix.length).split(/ +/g)
    const command = args.shift()
    if(!message.content.startsWith(config.prefix)) return;
    if(command === "printEmbed"){message.channel.send("test message")}
    if(command === "verify"){
      const username = args[0]
      const linkedAccount = await getLinkedDiscord(username)
      const playerUUID = await getUUID(username);
      const authorID = message.author.id;
      const embed_verified = new Discord.MessageEmbed()
      
        .setColor('#00c914')
        .addField('Verification successful ✅', `You gained the <@&801869477703712868> role and chat access`, false)
        .addField('Nickname changed to:', username, false)
        .setThumbnail(`https://crafatar.com/avatars/${playerUUID}`)
        .setTimestamp()
        .setFooter('Guarding the server\'s gate')
        
        /*var str1 = "Update your tag from " + linkedAccount;
        var str2 = " to " + message.author.tag;
        var str3 = str1.concat(str2);*/
      
        const embed_failed = new Discord.MessageEmbed()
        .setColor('#fc0303')
        .setTitle('Verification failed  ❌')
        .addField(`Update your tag from \`${linkedAccount}\n\` to \`${message.author.tag}\n\``, 'Here is a **[guide](https://www.youtube.com/watch?v=gqUPbkxxKLI&feature=emb_logo)** on how to link your account on Hypixel', false)
        .setFooter('A self-coded bot')
        //.addField('Looks like your account is not linked or is out-dated', 'Here is a **[guide](https://www.youtube.com/watch?v=gqUPbkxxKLI&feature=emb_logo)** on how to link your account on Hypixel', true)
        .attachFiles(['./images/guide.png'])
        .setImage('attachment://guide.png')
        .setTimestamp()
        .setFooter('Guarding the server\'s gate')

        const embed_failed_none = new Discord.MessageEmbed()
        .setColor('#fc0303')
        .setTitle('Verification failed  ❌')
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
            
      

      if(!guildID){
        // Checks if it is in any guild
        guildName = guild.name;
        embed_verified.setTitle('Guild found: ' + guildName)
        setTimeout(function(){message.member.roles.remove(config.memberRole)}, 110);
      }else if(!guildID && !message.member.roles.cache.has(config.memberRole)){
        embed_verified.setTitle('No guild found')
      }else if(guildID === config.hypixelGuild && message.member.roles.cache.has(config.memberRole)){
        // User is not in guild, but has the member role
        message.channel.send(embed_member_left)
        setTimeout(function(){removeMemberRole(authorID), 110};
      }
      

      if(guildID && guildID === config.hypixelGuild){
        // This will run if  the user is in the guild
        isInGuild = true
      }else if(guildID){
        // This will run if the user is not in the guild, but is in any guild.
        
      }
      message.member.setNickname(username).catch(console.log)
      message.member.roles.add([config.verifiedRole]).then(()=>{
        if(isInGuild){
        message.channel.send(embed_verified)
        message.channel.send(authorID);
        } else {
            // If it is in the guild, then add the member role

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
    }
})


// gets token from token.txt file and logs in with it.
const token = fs.readFileSync(__dirname+"/./token.txt").toString()
client.login(token)
