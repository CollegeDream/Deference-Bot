module.exports = {
    name: 'help',
    description: 'send help messages',
    async execute(message, args){
        message.channel.send('The bot is early in its development process, here are the current commands: \n &verify\n &test aliases\n &hug\n &g\n stats\n ')
    },
}