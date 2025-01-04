const Discord = require('discord.js');
const config = require("../config");

module.exports = {
    name: 'caca',
    description: `Permet d'avoir la confirmation de caca.`,

    async execute(client, message, args) {
        const msg = await message.channel.send("oui, caca");
    }
};
