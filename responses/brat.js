const Discord = require('discord.js');

module.exports = {
    name: 'br',
    description: `Charli XCX - Brat`,

    async execute(client, message, args) {
        try {
            await message.channel.send("AT");
        } catch (error) {
            console.error(error);
        }
    }
};