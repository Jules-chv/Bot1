const Discord = require('discord.js');
const config = require("../config");
const db = require('quick.db');
const cl = new db.table("Color");
const warnsDb = new db.table("Warns");

module.exports = {
    name: 'warn',
    description: `Permet de gérer les avertissements d'un utilisateur avec les actions: add, list, remove, clear.`,

    async execute(client, message, args) {
        let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;

        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('Vous n\'avez pas la permission pour utiliser cette commande.');
        }

        const action = args[0];
        const user = message.mentions.users.first();

        if (!user) return message.reply('Veuillez mentionner un utilisateur.');

        switch (action) {
            case 'add':
                const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';
                warnsDb.push(`${message.guild.id}_${user.id}`, reason);
                message.channel.send(`${user.tag} a été averti pour : ${reason}`);
                break;

            case 'list':
                const warns = warnsDb.get(`${message.guild.id}_${user.id}`) || [];
                if (warns.length === 0) return message.reply(`${user.tag} n'a aucun avertissement.`);
                const warnList = warns.map((warn, index) => `${index + 1}. ${warn}`).join('\n');
                message.channel.send(`Avertissements de ${user.tag}:\n${warnList}`);
                break;

            case 'remove':
                const warnIndex = parseInt(args[2]) - 1;
                if (isNaN(warnIndex)) return message.reply('Veuillez spécifier un numéro d\'avertissement valide.');
                const userWarns = warnsDb.get(`${message.guild.id}_${user.id}`) || [];
                if (!userWarns[warnIndex]) return message.reply('Aucun avertissement trouvé à ce numéro.');
                userWarns.splice(warnIndex, 1);
                warnsDb.set(`${message.guild.id}_${user.id}`, userWarns);
                message.channel.send(`L\'avertissement numéro ${warnIndex + 1} de ${user.tag} a été supprimé.`);
                break;

            case 'clear':
                warnsDb.delete(`${message.guild.id}_${user.id}`);
                message.channel.send(`Tous les avertissements de ${user.tag} ont été supprimés.`);
                break;

            default:
                message.reply('Action invalide. Utilisez: add, list, remove, clear.');
        }
    }
};
