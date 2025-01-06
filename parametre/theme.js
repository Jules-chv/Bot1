const Discord = require("discord.js");
const db = require('quick.db');
const owner = new db.table("Owner");
const cl = new db.table("Color");
const config = require("../config");

module.exports = {
    name: 'theme',
    usage: 'theme <couleur>',
    description: `Permet de changer la couleur de l'embed dans config.json.`,
    async execute(client, message, args) {

        // Vérification si l'utilisateur est propriétaire ou dans la liste des acheteurs
        if (owner.get(`owners.${message.author.id}`) || config.bot.buyer.includes(message.author.id)) {

            let color = args[0];
            if (!color) return message.reply("Merci d'indiquer la couleur que vous souhaitez");

            // Vérification du format hexadécimal
            if (!/^#[0-9A-F]{6}$/i.test(color)) {
                return message.reply("Merci d'entrer une couleur au format hexadécimal (ex: #FF0000)");
            }

            // Enregistrer la nouvelle couleur dans la base de données
            cl.set(`color_${message.guild.id}`, color);

            // Mettre à jour le fichier config (correction ici : éviter .set() sur un objet standard)
            config.bot.couleur[`color_${message.guild.id}`] = color;

            message.channel.send(`La couleur des embeds a été modifiée en ${color}`);
        } else {
            message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
        }
    }
}
