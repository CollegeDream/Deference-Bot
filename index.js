const config = require("./config.json")
const fetch = require("node-fetch")
const fs = require("fs")
const { token, littleKey, port } = require('./config.json');
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

async function getOnlineStatus(username){
  return fetch(`https://api.slothpixel.me/api/players/${username}/status`)
  .then(result => result.json())
  .then(({game}) => {
    return game
  }).catch(e=>console.log(e));
};


const Discord = require('discord.js');
const { measureMemory } = require("vm");
const { rejects } = require("assert");
const { error } = require("console");
const client = new Discord.Client();

client.on("ready", () => {client.user.setActivity("&help")})
//=>console.log(`${client.user.tag} is online!`)
client.on("message", async message => {
  //if(message.author.bot) return;
  

  if(!message.guild || message.guild.id !== config.targetGuild) return;
    //const args = message.content.slice(config.prefix.length).split(/ +/g)
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if(!message.content.startsWith(config.prefix)) return;

    if(command === "help"){
      message.channel.send('Bot in development, help command will be available later!\nCurrent commands:\n&verify\n&hug\n&test aliases\n&stats')
    }

    if(command === "test"){
      if(!args.length){
        return message.channel.send('no argument provided');
      } else if (args[0] === "aliases"){
        if(!args[1]){
          message.channel.send(`Provide a username, ${message.author.toString()}`)
        } else if(args[1].toLowerCase() === "collegedream"){
          return message.channel.send('.')
        } else {
          const IGN = args[1];
          const playerUUID = await getUUID(IGN);
          //if(!playerUUID){
          //  message.channel.send('Could not find a player with this IGN');
         // } else {
          const player = await getPlayer(IGN);
          var myArray = player.knownAliases;
            

          async function printAliases(myArray){
            var myArray = player.knownAliases;
            let msg = message.channel.send('Calculating...');
          /*.then((msg)=>{
            setTimeout(function(){
              msg.edit('Estimated time: 2 seconds');
              }, 2000);
          })*/
          msg.edit('Estimated time: 2 seconds')
          await new Promise((resolve, reject)=>{
            // wait for 50 ms.
            setTimeout(function(){resolve(msg)}, 5000);
          }).then((msg) => msg.edit('Sending the name!'));
        
            return myArray;
          }
          async function sending(){
            let thirdArray = await printAliases(myArray);
            message.channel.send(thirdArray.join('\n'))
          }

          await sending();
          

      }
      }
      
    }
    
    if(command === "hug"){
      let replies = ["You are wonderful!", 
        "You are enough!",
        "You are loved!",
        "Everything about you makes me happy!",
        `I love you, ${message.author.toString()}!`,
        "You are my sunshine!",
        "Being around you makes my whole day!",
        "Here's a free hug, next one costs $2.00",
        "Believe in yourself!",
        "I just wanna sit next to you until forever!",
        "You are unique! Embrace who you are.",
        "You bring out the best in other people!",
        "You're more fun than bubble wrap!",
        "Our community is better when you're in it!",
        "I bet you do crossword puzzles in ink! (you're confident)",
        `${message.author.toString()}, I'm proud of you!`,
        "You melt my heart whenever I see you!"

      ];
      message.channel.send(replies[Math.floor(Math.random() * replies.length)]).then((message) => {
        message.react('🤗');
      }).catch(err => {console.log(err);})
    
    }

    if(command === "verify"){
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
            message.channel.send(`Display Name: ${player.displayname} (these are for testing)`)
            message.channel.send(`Network level: ${networkLevel.toFixed(2)}`)
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

    if(command === "stats"){
      
      const username = args[0]
      if(!username) return message.reply("You need to say your minecraft username.")

      const linkedAccount = await getLinkedDiscord(username)
      const playerUUID = await getUUID(username);
      const authorID = message.author.id;
      const player = await getPlayer(username);
      const bedwarsLevel = player.achievements.bedwars_level;
      
      var networkLevel = (Math.sqrt(player.networkExp + 15312.5) - 125/Math.sqrt(2))/(25*Math.sqrt(2));
      var joinedDate = new Date(player.firstLogin);
      //const playerObject = await getPlayer(username)
      /*async function getOnlineStatus(username){
        const response = await fetch(`https://api.slothpixel.me/api/players/${username}/status`)
        const data = await response.json();
        //const {game} = data;
        //let gameType = game.type;
        message.channel.send(`Game type: ${data.game.type}`)

      }*/
      const status = await getOnlineStatus(username);
      message.channel.send(`Online status: ${status.type}`)
      message.channel.send(`Network level: ${networkLevel.toFixed(2)}`);
      message.channel.send(`First joined: ${joinedDate}`);
      message.channel.send(`Bedwars stars: ${player. achievements.bedwars_level} (this bot is in beta)`)
    }
})

//const token = fs.readFileSync(__dirname+"/./token.txt").toString()
client.login(littleKey)
