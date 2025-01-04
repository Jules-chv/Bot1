const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convocation')
        .setDescription('Créer une convocation.')
        .addStringOption(option => 
            option.setName('nom')
                .setDescription('Nom de la personne concernée')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('Motif de la convocation')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('date')
                .setDescription('Date et heure de la convocation (ex : 10/01/2025 à 14h)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('lieu')
                .setDescription('Lieu de la convocation (ex : Salle des professeurs)')
                .setRequired(true)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const raison = interaction.options.getString('raison');
        const date = interaction.options.getString('date');
        const lieu = interaction.options.getString('lieu');

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

        await interaction.reply({ content: `+convocation`, embeds: [embed] });
    },
};
