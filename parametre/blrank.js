const Discord = require('discord.js');
const db = require('quick.db');
const {
    MessageActionRow,
    MessageButton,
} = require('discord-buttons');

module.exports = {
    name: 'blacklistrank',
    aliases: ['blrank'],
    run: async (client, message, args, prefix, color) => {
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true) {
            if (args[0] === 'add') {
                // Récupérer l'utilisateur
                let member = client.users.cache.get(args[1]) || message.mentions.users.first();
                if (!member) {
                    return message.channel.send(`Aucun membre trouvé pour \`${args[1] || ' '}\``);
                }

                // Vérifier s'il est déjà blacklisté
                if (db.get(`blrankmd_${client.user.id}_${member.id}`) === true) {
                    return message.channel.send(`${member.username} est déjà dans la Blacklist Rank.`);
                }

                // Ajouter à la blacklist
                db.set(`blrankmd_${client.user.id}_${member.id}`, true);
                return message.channel.send(`${member.username} a été ajouté à la Blacklist Rank.`);
            } 
            
            else if (args[0] === 'remove') {
                // Récupérer l'utilisateur
                let member = client.users.cache.get(args[1]) || message.mentions.users.first();
                if (!member) {
                    return message.channel.send(`Aucun membre trouvé pour \`${args[1] || ' '}\``);
                }

                // Vérifier s'il est dans la blacklist
                if (db.get(`blrankmd_${client.user.id}_${member.id}`) === null) {
                    return message.channel.send(`${member.username} n'est pas dans la Blacklist Rank.`);
                }

                // Retirer de la blacklist
                db.delete(`blrankmd_${client.user.id}_${member.id}`);
                return message.channel.send(`${member.username} a été retiré de la Blacklist Rank.`);
            } 
            
            else if (args[0] === 'list') {
                // Récupérer la liste des utilisateurs blacklistés
                const blacklist = db.all().filter(data => data.ID.startsWith(`blrankmd_${client.user.id}`));
                if (blacklist.length === 0) {
                    return message.channel.send('La Blacklist Rank est vide.');
                }

                let page = 1;
                const usersPerPage = 5;

                // Générer l'embed de la liste
                const generateEmbed = () => {
                    const start = (page - 1) * usersPerPage;
                    const end = page * usersPerPage;

                    const embed = new Discord.MessageEmbed()
                        .setTitle('Blacklist Rank')
                        .setDescription(
                            blacklist.slice(start, end).map((data, i) => {
                                const userId = data.ID.split('_')[2];
                                const user = client.users.cache.get(userId);
                                return `${start + i + 1}) ${user ? user.tag : 'Utilisateur inconnu'} (${userId})`;
                            }).join('\n')
                        )
                        .setFooter(`Page ${page}/${Math.ceil(blacklist.length / usersPerPage)}`)
                        .setColor(color);

                    return embed;
                };

                const embed = generateEmbed();
                const msg = await message.channel.send({ embed });

                // Ajouter des boutons pour naviguer
                if (blacklist.l
