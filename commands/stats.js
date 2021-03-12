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

module.exports = {
    name: 'stats',
    description: 'print statistics',
    async execute(message, args){
      

        const username = args[0]
        if(!username) return message.reply("You need to say your minecraft username.")
  
        //const linkedAccount = await getLinkedDiscord(username);

        const playerUUID = getUUID(username);
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
        //const status = getOnlineStatus(username);
        message.channel.send(`Online status: \n
        Network level: ${networkLevel.toFixed(2)}\n
        First joined: ${joinedDate}\n
        Bedwars stars: ${bedwarsLevel} stars (this bot is in beta)`)
    
    },
};