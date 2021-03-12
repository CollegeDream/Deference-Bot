
module.exports = {
    name: 'stats',
    description: 'print statistics',
    execute(){
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

        async function getOnlineStatus(username){
        return fetch(`https://api.slothpixel.me/api/players/${username}/status`)
        .then(result => result.json())
        .then(({game}) => {
        return game
        }).catch(e=>console.log(e));
        };
        const username = args[0]
        if(!username) return message.reply("You need to say your minecraft username.")
  
        const linkedAccount = getLinkedDiscord(username)
        const playerUUID = getUUID(username);
        const authorID = message.author.id;
        const player = getPlayer(username);
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
        const status = getOnlineStatus(username);
        message.channel.send(`Online status: ${status.type}\n
        Network level: ${networkLevel.toFixed(2)}\n
        First joined: ${joinedDate}\n
        Bedwars stars: ${player. achievements.bedwars_level} (this bot is in beta)`)
    },
};