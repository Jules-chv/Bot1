const Discord = require('discord.js');
const config = require("../config");
const db = require('quick.db');
const cl = new db.table("Color");

module.exports = {
    name: 'br',
    description: `Charli XCX - Brat`,

    async execute(client, message, args) {
        message.channel.send("AT")
    }
};