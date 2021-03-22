const config = require("../config.json")
const fetch = require("node-fetch")
const fs = require("fs");
const Discord = require('discord.js');
const QuickChart = require('quickchart-js');
const saveUUID = require('../Schemas/saveUUID')
const mongo = require('../mongo')

function getUsername(playerID) {
    return fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${playerID}`)
    .then(data => data.json())
    .then(({name}) => {
      return name
    }).catch(e=>null);
}

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



module.exports = {
    name: 'g',
    description: 'get the guild of a player',
    cooldown: 6,
    async execute(message, args){
        let author;
        let playerID;
        await mongo().then(async (mongoose) => {
            try{
                author = await saveUUID.findOne({_id: message.author.id}, (err)=>{
                    if(err){
                        message.channel.send('Error occured: ' + err)
                    }
                })
                if(author){
                    playerID = author.uuid;
                }
            } finally {
                mongoose.connection.close()
                setUsername();
            }
        })
        async function setUsername(){
            let username;
            if(args[0]){
                username = args[0];
            } else if (!author && !args[0]){
                return message.reply('You are not linked! Use &register[IGN] first.');
            } else {
                username = await getUsername(playerID).catch(e=>message.channel.send(e))
            }
            if(username){
            const playerUUID = await getUUID(username).catch(e=>console.log(e));
            const player = await getPlayer(username).catch(e=>console.log(e));
            const guildID = await getGuild(username);
            const guild = await guildInfo(guildID).catch(e=>null);
            let exp = guild.exp

            const EXP_NEEDED = [100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 2500000, 2500000, 2500000, 2500000, 3000000];
            // A list of amount of XP required for leveling up in each of the beginning levels (1-15).

            function getLevel(exp) {
            let level = 0;

            for (let i = 0; i <= 1000; i += 1) {
            // Increment by one from zero to the level cap.
                let need = 0;
                if (i >= EXP_NEEDED.length) {
                need = EXP_NEEDED[EXP_NEEDED.length - 1];
                } else {
                need = EXP_NEEDED[i];
                }
                // Determine the current amount of XP required to level up,
                // in regards to the "i" variable.

                if ((exp - need) < 0) {
                return Math.round((level + (exp / need)) * 100) / 100;
                }
                // If the remaining exp < the total amount of XP required for the next level,
                // return their level using this formula.

                level += 1;
                exp -= need;
                // Otherwise, increase their level by one,
                // and subtract the required amount of XP to level up,
                // from the total amount of XP that the guild had.
            }
            
            return 1000;
            // This should never happen...
            }
            



            let expTotal = 0;
            var expArray = new Array();
            var expArray_2 = new Array();
            var dateArray = new Array();
            const myChart = new QuickChart();
                myChart
                .setWidth(1000)
                .setHeight(500)
                .setFormat('png')
                .setBackgroundColor('transparent')


            const guild_Embed = new Discord.MessageEmbed()
                .setColor('#e0cf12')
                .setThumbnail(`https://visage.surgeplay.com/full/${playerUUID}?size=240`)
                .setTitle(`${player.displayname}`)
                .setAuthor('GEXP contribution')
                .setURL(`https://plancke.io/hypixel/player/stats/${player.displayname}`)
                .setFooter('Bot is in development')
             for(i in guild.members) {
                if (guild.members[i].uuid === playerUUID) {
                    guildMember = guild.members[i];
                    guildNameURL = encodeURIComponent(guild.name.trim());
                    guild_Embed.addField(`Guild`, `**[${guild.name} [${guild.tag}]](https://plancke.io/hypixel/guild/name/${guildNameURL})**`, true)
                    guild_Embed.addField('Rank', `${guildMember.rank}`, true)
                    guild_Embed.addField('Member', `${guild.members.length}/125`, true)
                    guild_Embed.addField('Guild Level', `${getLevel(exp)}`, true)
                    for(x in guildMember.expHistory){
                        expArray.push(`${x}: \*\*${guildMember.expHistory[x]}\*\*`);
                        dateArray.push(x);
                        expArray_2.push(guildMember.expHistory[x]);
                        expTotal += guildMember.expHistory[x];
                    }
                    myChart.setConfig({
                        type: 'bar',
                        
                        data: {
                            labels: dateArray.reverse(),
                            offset: '0',
                            datasets: [
                           {
                                type: 'line',
                                label: 'GEXP',
                                borderColor: 'rgb(18, 224, 32)',
                                backgroundColor: 'rgba(18, 224, 32, 0.25)',
                                fill: true,
                                offset: '0',
                                data: expArray_2.reverse()

                            }]
                          },
                          options: {
                            scales: {
                              xAxes: [{
                                offset: false,
                                scaleLabel : {
                                    display: true,
                                    labelString: 'DATE'
                                }
                              }],
                              yAxes: [{
                                  scaleLabel: {
                                      display: true,
                                      labelString: 'GEXP'
                                  }
                              }]
                            }
                          }
                      })
                }
            }
            
            guild_Embed.setImage(myChart.getUrl());
            guild_Embed.addField('GEXP', expArray.join('\n'), false)
            guild_Embed.addField(`Total GEXP for the week: ${expTotal}`, '\u200B', false)
            message.channel.send(guild_Embed);
            }
        }
    },  
}
process.on("unhandledRejection", (err) => {
   console.log(err);
})
