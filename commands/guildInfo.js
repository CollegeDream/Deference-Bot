const config = require("../config.json")
const fetch = require("node-fetch")
const fs = require("fs");
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

const Discord = require('discord.js');

module.exports = {
    name: 'g',
    description: 'get the guild of a player',
    async execute(message, args){
        let author;
        let playerID;
        let username;
        await mongo().then(async (mongoose) => {
            try{
                author = await saveUUID.findOne({_id: message.author.id}, (err)=>{
                    message.channel.send(err);
                })
                if(author){
                    playerID = author.uuid;
                }
            } finally {
                mongoose.connection.close()
                
            }
        })
        async function setUsername(){
            if(args[0]){
                username = args[0];
                return username;
            } else if (!author && !args[0]){
                return message.reply('You are not linked!');
            } else {
                username = await getUsername(playerID)
                return username;
            }
        }
        if(username){
            const playerUUID = await getUUID(username).catch(e=>console.log(e));
            const player = await getPlayer(username).catch(e=>console.log(e));
            const guildID = await getGuild(username);
            const guild = await guildInfo(guildID).catch(e=>null);
            //console.log('hey')
            //await getExpHistory(username); 
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
                                offset: false
                              }]
                            }
                          }
                      })
                }
            }
            
            guild_Embed.setImage(myChart.getUrl());
            guild_Embed.setDescription(expArray.reverse().join('\n'))
            guild_Embed.addField(`Total GEXP for the week: ${expTotal}`, '\u200B', false)
            message.channel.send(guild_Embed);
        }
    },  
}
process.on("unhandledRejection", (err) => {
   console.log(err);
})
