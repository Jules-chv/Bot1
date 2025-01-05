const { EmbedBuilder } = require("discord.js");
const db = require('quick.db');
const cl = new db.table("Color");
const owner = new db.table("Owner");
const config = require("../config");
const p1 = new db.table("Perm1");
const p2 = new db.table("Perm2");
const p3 = new db.table("Perm3");

module.exports = {
    name: 'bypass',
    usage: 'bypass',
    description: `Permet de voir quelles ranks peuvent bypass des permissions.`,
    async execute(client, message, args) {

        // Définir les IDs des rôles
        const perm1 = "ID_ROLE_1";
        const perm2 = "ID_ROLE_2";
        const perm3 = "ID_ROLE_3";

        // Vérification des permissions
        if (
            owner.get(`owners.${message.author.id}`) ||
            message.member.roles.cache.has(perm1) ||
            message.member.roles.cache.has(perm2) ||
            message.member.roles.cache.has(perm3) ||
            config.bot.buyer.includes(message.author.id)
        ) {
            // Récupération de la couleur
            let color = cl.fetch(`color_${message.guild.id}`);
            if (!color) color = config.bot.couleur;

            // Création de l'embed
            const embed = new EmbedBuilder()
                .setColor(color)
                .setDescription(`
**\`antiadmin | Owner\`**
**\`antiban | Owner\`**
**\`antiupdate | Owner\`**
**\`antibot | Owner\`**
**\`antilink | Owner | Wl\`**
**\`antieveryone | Owner | Wl\`**
**\`antichannel create | Owner | Wl\`**
**\`antichannel delete | Owner\`**
**\`antichannel update | Owner\`**
**\`antirôle create | Owner\`**
**\`antirôle delete | Owner\`**
**\`antirôle update | Owner\`**
**\`antiwebhook | Owner\`**
`);

            // Envoi de l'embed
            return message.channel.send({ embeds: [embed] });
        } else {
            return message.channel.send("❌ Vous n'avez pas les permissions nécessaires pour exécuter cette commande.");
        }
    }
};
