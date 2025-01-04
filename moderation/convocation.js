const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'convocation', // Nom de la commande
    description: 'Créer une convocation.',

    async execute(message, args) {
        // Vérifiez si les arguments sont suffisants
        if (args.length < 4) {
            return message.reply('Usage : +convocation <nom> <raison> <date> <lieu>');
        }

        const [nom, raison, date, ...lieuArr] = args; // Divisez les arguments
        const lieu = lieuArr.join(' '); // Combinez les arguments restants pour former le lieu

        // Créer l'embed
        const embed = new MessageEmbed()
            .setColor('#007BFF')
            .setTitle('📜 Convocation Officielle')
            .setDescription(`Veuillez trouver ci-dessous les détails de la convocation.`)
            .addFields(
                { name: '👤 Nom', value: nom, inline: true },
                { name: '📄 Raison', value: raison, inline: true },
                { name: '🕒 Date et Heure', value: date, inline: false },
                { name: '📍 Lieu', value: lieu, inline: false }
            )
            .setFooter({ text: 'Merci de respecter cet horaire.', iconURL: 'https://example.com/icon.png' })
            .setTimestamp();

        // Envoyer l'embed dans le canal
        await message.channel.send({ content: `+convocation`, embeds: [embed] });
    },
};
