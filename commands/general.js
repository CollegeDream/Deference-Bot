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

            let playerInfo = await game_stats(player, rebornPlayer);
            let playerInfoArray = [];
            for(x in playerInfo){
                playerInfoArray.push(`${x}: \`${playerInfo[x]}\``)
            }


            
            general_stats.addField('\*\*Information\*\*', playerInfoArray.join('\n'), true)
            calculateOfflineTime(player.lastLogin, player.lastLogout, timeConverter)
            function calculateOfflineTime(lastLogin, lastLogout, convertFunc){
                lastLoginTime = convertFunc(lastLogin);
                lastLogoutTime = convertFunc(lastLogout);
            }


              
            message.channel.send(general_stats)



            async function rankColor(){
                if(player.rankPlusColor){
                    return await plusColor(player.rankPlusColor.replace(/_/g, ""));
                } else {
                    return '36393E'
                }
            }
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

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        async function game_stats(player, rebornPlayer){
            let game_stats = [
                {
                    'game': 'Bedwars',
                    'coins': player.stats.Bedwars.coins || 0,
                    'wins': player.stats.Bedwars.wins_bedwars || 0,
                    'losses': player.stats.Bedwars.losses_bedwars || 0,
                    'kills': player.stats.Bedwars.kills_bedwars || 0,
                },
                {
                    'game': 'Skywars',
                    'coins': player.stats.SkyWars.coins || 0,
                    'wins': player.stats.SkyWars.wins || 0,
                    'losses': player.stats.SkyWars.losses || 0,
                    'kills': player.stats.SkyWars.kills || 0,
                },
                {
                    'game': 'Murder Mystery',
                    'coins': player.stats.MurderMystery.coins || 0,
                    'wins': player.stats.MurderMystery.wins || 0,
                    'losses': player.stats.MurderMystery.losses || 0,
                    'kills': player.stats.MurderMystery.kills || 0,
                },
                {
                    'game': 'TNT run',
                    'coins': player.stats.TNTGames.coins || 0,
                    'wins': player.stats.TNTGames.wins || 0,
                    'losses': player.stats.TNTGames.losses || 0,
                    'kills': await tnt_run_kills() || 0,
                },
                {
                    'game': 'Duels',
                    'coins': player.stats.Duels.coins || 0,
                    'wins': player.stats.Duels.wins || 0,
                    'losses': player.stats.Duels.losses || 0,
                    'kills': player.stats.Duels.kills || 0,
                },
                {
                    'game': 'Arcade',
                    'coins': player.stats.Arcade.coins || 0,
                    'wins': 0,
                    'losses': 0,
                    'kills': 0,
                }
            ]

            async function tnt_run_kills(){
                let kills = {
                    'TNTtag': player.stats.TNTGames.kills_tntag || 0,
                    'pvprun': player.stats.TNTGames.kills_pvprun || 0,
                    'capture': player.stats.TNTGames.kills_capture || 0,
                }
                let kills_total = 0;
                for(mode in kills){
                    kills_total += kills[mode];
                }
                return kills_total;
            }

            let total_kills = game_stats.reduce((acc, cur) => {
                return acc + cur.kills;
            }, 0)

            let total_wins = game_stats.reduce((acc, cur) => {
                return acc + cur.wins;
            }, 0)

            let total_coins = game_stats.reduce((acc, cur) => {
                return acc + cur.coins;
            }, 0)
            let networkLevel = (Math.sqrt(player.networkExp + 15312.5) - 125/Math.sqrt(2))/(25*Math.sqrt(2));

            let playerInfo = {
                'Level': numberWithCommas(networkLevel.toFixed(2)),
                'Experience': numberWithCommas(player.networkExp),
                'AP': numberWithCommas(player.achievementPoints),
                'Total kills': numberWithCommas(total_kills),
                'Total wins': numberWithCommas(total_wins),
                'Total coins': numberWithCommas(total_coins),
            }

            return playerInfo;
        }

        async function getSocial(player){
            
        }

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
        //const status = await hypixel.getStatus('sonofaplatypus').catch(e => console.error(e));
        //console.log(status.game.game);
        
    }
    
}