module.exports = {
    name: 'stats',
    description: 'print statistics',
    execute(){
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
        message.channel.send(`Online status: ${status.type}\n
        Network level: ${networkLevel.toFixed(2)}\n
        First joined: ${joinedDate}\n
        Bedwars stars: ${player. achievements.bedwars_level} (this bot is in beta)`)
    },
};