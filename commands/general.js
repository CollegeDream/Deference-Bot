const fetch = require('node-fetch')
const Discord = require('discord.js')
const mongo = require('../mongo')
const config = require('../config.json')
const saveUUID = require('../Schemas/saveUUID')
const Hypixel = require('hypixel-api-reborn');
const hypixel = new Hypixel.Client(config.apiKey);
const plusColor = require('./plusColor')

module.exports = {
    name: 'hypixel',
    description: 'returns a players general stats',
    cooldown: 6,
    async execute(message, args){
            async function getDataFromDB(authorID){
                return await mongo().then(async (mongoose) => {
                    try { 
                        return await saveUUID.findOne({_id: authorID})
                    } catch(err) {
                        console.log(err)
                    } finally {
                        mongoose.connection.close();
                }
            })
        }
        
        const data = await getDataFromDB(message.author.id).catch(e=>console.log(e));
        
        async function getPlayer(username){
            if(username){
                let player = await getPlayerWithName(username).catch(e=>console.log(e));
                if(player){
                    return player;
                } else {
                    message.channel.send('This player does not exist!');
                }
            } else {
                if(data){
                    return await getPlayerWithID(data.uuid);
                } else {
                    message.channel.send('Provide an IGN, or use \`&register\` to use \`&hypixel\` with no arguments')
                }
            }
        }

        function getUUID(username) {
            return fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
            .then(data => data.json())
            .then((player) => {
              return player.id
            }).catch(e=>null);
        }

        async function getPlayerWithName(username){
            const id = await getUUID(username)
            return fetch(`https://api.hypixel.net/player?uuid=${id}&key=${config.apiKey}`)
            .then(result => result.json())
            .then(({player}) => {
            return player
        }).catch(e=>null);
        };

        async function getPlayerWithID(uuid){
            return fetch(`https://api.hypixel.net/player?uuid=${uuid}&key=${config.apiKey}`)
            .then(response => response.json())
            .then(({player})=>{
                return player
            }).catch(e=>console.log(e));
        }

        const player = await getPlayer(args[0]).catch(e=>console.log(e));
        if(player){generalStats(player)}
            
        async function generalStats(player){
            let ign = player.displayname;
            let rebornPlayer = await hypixel.getPlayer(ign).catch(e => console.error(e));
            let playerStatus = await hypixel.getStatus(ign).catch(e => console.error(e));
            let {rank} = rebornPlayer;
            let general_stats = new Discord.MessageEmbed();
            general_stats.setTitle(`[${rank}] ${ign}`)
            general_stats.setURL(`https://plancke.io/hypixel/player/stats/${ign}`)
            general_stats.setColor(await rankColor())
            let status_string;
            if(playerStatus.online == true){
                status_string = '\*\*🟢 Online\*\*'
            } else {
                status_string = '\*\*🔴 Offline\*\* has been offline for '
            }
            let lastLoginTime;
            let lastLogoutTime;

            calculateOfflineTime(player.lastLogin, player.lastLogout, timeConverter)
            function calculateOfflineTime(lastLogin, lastLogout, convertFunc){
                lastLoginTime = convertFunc(lastLogin);
                lastLogoutTime = convertFunc(lastLogout);
            }

            let networkLevel = (Math.sqrt(player.networkExp + 15312.5) - 125/Math.sqrt(2))/(25*Math.sqrt(2));
            let game_stats = [
                {
                    'game': 'Bedwars',
                    'wins': player.stats.Bedwars.wins_bedwars || 0,
                    'losses': player.stats.Bedwars.losses_bedwars || 0,
                    'kills': player.stats.Bedwars.kills_bedwars || 0,
                },
                {
                    'game': 'Skywars',
                    'wins': player.stats.Skywars.wins || 0,
                    'losses': player.stats.Skywars.losses || 0,
                    'kills': player.stats.Skywars.kills || 0,
                },
                {
                    'game': 'Murder Mystery',
                    'wins': player.stats.MurderMystery.wins || 0,
                    'losses': player.stats.MurderMystery.losses || 0,
                    'kills': player.stats.MurderMystery.kills || 0,
                },
                {
                    'game': 'TNT run',
                    'wins': player.stats.TNTGames.wins || 0,
                    'losses': player.stats.TNTGames.losses || 0,
                    'kills':{
                                'TNTtag': player.stats.TNTGames.kills_tntag,
                                'pvprun': player.stats.TNTGames.kills_pvprun,
                                'capture': player.stats.TNTGames.kills_capture,
                            }
                }
            ]
            let playerInfo = {
                'Level': networkLevel,
                'Experience': numberWithCommas(player.networkExp),
                'AP': numberWithCommas(player.achievementPoints),
                'dsa': ra

            }


            
            general_stats.addField('\*\*Information\*\*', )
            calculateOfflineTime(player.lastLogin, player.lastLogout, timeConverter)
            function calculateOfflineTime(lastLogin, lastLogout, convertFunc){
                lastLoginTime = convertFunc(lastLogin);
                lastLogoutTime = convertFunc(lastLogout);
            }

            function timeConverter(UNIX_timestamp){
                
                const milliseconds = UNIX_timestamp 

                const dateObject = new Date(milliseconds)
                
                const humanDateFormat = dateObject.toLocaleString() 
                
                dateObject.toLocaleString("en-US", {weekday: "long"}) 
                dateObject.toLocaleString("en-US", {month: "long"}) 
                dateObject.toLocaleString("en-US", {day: "numeric"}) 
                dateObject.toLocaleString("en-US", {year: "numeric"})
                dateObject.toLocaleString("en-US", {hour: "numeric"}) 
                dateObject.toLocaleString("en-US", {minute: "numeric"})
                dateObject.toLocaleString("en-US", {second: "numeric"}) 
                dateObject.toLocaleString("en-US", {timeZoneName: "short"}) 
                return humanDateFormat;
              }
              
            message.channel.send(general_stats)

            function numberWithCommas(x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }

            async function rankColor(){
                if(player.rankPlusColor){
                    return await plusColor(player.rankPlusColor.replace(/_/g, ""));
                } else {
                    return '36393E'
                }
            }
        }   
        
        //const status = await hypixel.getStatus('sonofaplatypus').catch(e => console.error(e));
        //console.log(status.game.game);
        
    }
    
}