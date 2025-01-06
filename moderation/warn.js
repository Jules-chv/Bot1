const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const db = require("quick.db");
const random_string = require("randomstring");

module.exports = {
    name: "warn",
    aliases: ["sanctions"],
    run: async (client, message, args, prefix, color) => {
        // Récupération des logs
        const logsChannelId = db.get(`logmod_${message.guild.id}`);
        const logsChannel = message.guild.channels.cache.get(logsChannelId);

        // Vérification des permissions
        let hasPermission = false;
        message.member.roles.cache.forEach((role) => {
            if (
                db.get(`modsp_${message.guild.id}_${role.id}`) ||
                db.get(`ownerp_${message.guild.id}_${role.id}`) ||
                db.get(`admin_${message.guild.id}_${role.id}`)
            ) {
                hasPermission = true;
            }
        });
        if (
            !hasPermission &&
            !client.config.owner.includes(message.author.id) &&
            db.get(`ownermd_${client.user.id}_${message.author.id}`) !== true
        ) {
            return message.channel.send(
                "Vous n'avez pas la permission d'utiliser cette commande."
            );
        }

        if (!args[0]) {
            return message.channel.send(
                `Utilisation : \`${prefix}warn <add|list|remove|clear>\``
            );
        }

        const subCommand = args[0].toLowerCase();

        if (subCommand === "add") {
            const user =
                message.mentions.users.first() ||
                client.users.cache.get(args[1]);

            if (!user) {
                return message.channel.send(
                    `Aucun membre trouvé pour \`${args[1] || "rien"}\`.`
                );
            }

            if (user.bot) return message.channel.send("Impossible de warn un bot.");
            if (user.id === message.author.id)
                return message.channel.send(
                    "Vous ne pouvez pas vous sanctionner vous-même !"
                );

            const guildMember = message.guild.members.cache.get(user.id);
            if (
                guildMember &&
                (guildMember.roles.highest.position >=
                    message.member.roles.highest.position ||
                    user.id === message.guild.ownerId)
            ) {
                return message.channel.send(
                    "Cette personne a un rôle plus élevé que vous ou est propriétaire du serveur."
                );
            }

            const reason = args.slice(2).join(" ") || "Aucune raison";
            const warnID = random_string.generate({
                charset: "numeric",
                length: 8,
            });

            db.push(`info.${message.guild.id}.${user.id}`, {
                moderator: message.author.tag,
                reason,
                date: Math.floor(Date.now() / 1000),
                id: warnID,
            });
            db.add(`number.${message.guild.id}.${user.id}`, 1);

            message.channel.send(
                `${user} a été **warn**${reason !== "Aucune raison" ? ` pour \`${reason}\`` : ""}.`
            );

            user
                .send(
                    `Vous avez été **warn** sur ${message.guild.name}${
                        reason !== "Aucune raison" ? ` pour \`${reason}\`` : ""
                    }.`)
                .catch(() => {});

            if (logsChannel) {
                logsChannel.send(
                    new MessageEmbed()
                        .setColor(color)
                        .setDescription(
                            `${message.author} a **warn** ${user}${
                                reason !== "Aucune raison" ? ` pour \`${reason}\`` : ""
                            }`
                        )
                );
            }
        }

        if (subCommand === "list") {
            const user =
                message.mentions.users.first() ||
                client.users.cache.get(args[1]) ||
                message.author;

            if (!user) {
                return message.channel.send(
                    `Aucun membre trouvé pour \`${args[1] || "rien"}\`.`
                );
            }

            const warnings = db.fetch(`info.${message.guild.id}.${user.id}`) || [];
            const warnCount = warnings.length;

            if (warnCount === 0) {
                return message.channel.send(`${user.tag} n'a aucune sanction.`);
            }

            let currentPage = 1;
            const perPage = 5;

            const generateEmbed = () => {
                const start = (currentPage - 1) * perPage;
                const end = start + perPage;

                const embed = new MessageEmbed()
                    .setTitle(`Sanctions de ${user.tag} (${warnCount})`)
                    .setColor(color)
                    .setDescription(
                        warnings
                            .slice(start, end)
                            .map(
                                (warn, index) =>
                                    `${start + index + 1}) **ID :** \`${warn.id}\`\n**Modérateur :** ${warn.moderator}\n**Raison :** ${warn.reason}\n**Date :** <t:${warn.date}>`
                            )
                            .join("\n\n")
                    )
                    .setFooter(`Page ${currentPage}/${Math.ceil(warnCount / perPage)}`);
                return embed;
            };

            const embed = generateEmbed();
            const messageButtons = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("prev")
                    .setLabel("◀")
                    .setStyle("PRIMARY")
                    .setDisabled(currentPage === 1),
                new MessageButton()
                    .setCustomId("next")
                    .setLabel("▶")
                    .setStyle("PRIMARY")
                    .setDisabled(currentPage === Math.ceil(warnCount / perPage))
            );

            const msg = await message.channel.send({ embeds: [embed], components: [messageButtons] });

            const collector = msg.createMessageComponentCollector({
                time: 60000,
            });

            collector.on("collect", async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({
                        content: "Vous ne pouvez pas interagir avec ce message.",
                        ephemeral: true,
                    });
                }

                if (interaction.customId === "prev") currentPage--;
                if (interaction.customId === "next") currentPage++;

                await interaction.update({
                    embeds: [generateEmbed()],
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setCustomId("prev")
                                .setLabel("◀")
                                .setStyle("PRIMARY")
                                .setDisabled(currentPage === 1),
                            new MessageButton()
                                .setCustomId("next")
                                .setLabel("▶")
                                .setStyle("PRIMARY")
                                .setDisabled(currentPage === Math.ceil(warnCount / perPage))
                        ),
                    ],
                });
            });

            collector.on("end", () => {
                msg.edit({ components: [] });
            });
        }

        if (subCommand === "remove") {
            const user =
                message.mentions.users.first() ||
                client.users.cache.get(args[1]);

            const warnID = args[2];

            if (!user) {
                return message.channel.send(
                    `Aucun membre trouvé pour \`${args[1] || "rien"}\`.`
                );
            }

            const warnings = db.fetch(`info.${message.guild.id}.${user.id}`) || [];
            const warningIndex = warnings.findIndex((w) => w.id === warnID);

            if (warningIndex === -1) {
                return message.channel.send(
                    `Aucune sanction trouvée avec l'ID \`${warnID}\`.`
                );
            }

            warnings.splice(warningIndex, 1);
            db.set(`info.${message.guild.id}.${user.id}`, warnings);
            db.subtract(`number.${message.guild.id}.${user.id}`, 1);

            return message.channel.send(`La sanction \`${warnID}\` a été retirée.`);
        }

        if (subCommand === "clear") {
            const user =
                message.mentions.users.first() ||
                client.users.cache.get(args[1]);

            if (!user) {
                return message.channel.send(
                    `Aucun membre trouvé pour \`${args[1] || "rien"}\`.`
                );
            }

            const warnCount = db.fetch(`number.${message.guild.id}.${user.id}`);
            if (!warnCount) {
                return message.channel.send(`${user.tag} n'a aucune sanction.`);
            }

            db.delete(`number.${message.guild.id}.${user.id}`);
            db.delete(`info.${message.guild.id}.${user.id}`);

            return message.channel.send(
                `${warnCount} sanction(s) ont été supprimées pour ${user.tag}.`
            );
        }
    },
};
