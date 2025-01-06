const Discord = require("discord.js");
const db = require('quick.db');
const fs = require('fs');
const owner = new db.table("Owner");
const cl = new db.table("Color");
const config = require("../config");

module.exports = {
    name: 'theme',
    usage: 'theme <couleur>',
    description: `Permet de changer la couleur de l'embed dans config.json.`,
    async execute(client, message, args) {

        // Vérification des permissions
        if (owner.get(`owners.${message.author.id}`) || config.bot.buyer.includes(message.author.id)) {

            let color = args[0];
            if (!color) return message.reply("Merci d'indiquer la couleur que vous souhaitez.");

            // Vérification du format hexadécimal
            if (!/^#[0-9A-F]{6}$/i.test(color)) {
                return message.reply("Merci d'entrer une couleur au format hexadécimal (ex: #FF0000)");
            }

            // **1. Mise à jour dans la base de données (Quick.DB)**
            cl.set(`color_${message.guild.id}`, color);

            // **2. Mise à jour dans le fichier config.json correctement**
            config.bot.couleur[message.guild.id] = color;

            try {
                fs.writeFileSync('./config.json', JSON.stringify(config, null, 4), 'utf8');
            } catch (error) {
                console.error('Erreur lors de l\'écriture dans config.json :', error);
                return message.reply("Une erreur est survenue lors de la sauvegarde dans le fichier.");
            }

            // Confirmation
            message.channel.send(`✅ La couleur des embeds a été modifiée avec succès en **${color}**.`);
        
        } else {
            message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
        }
    }
}
