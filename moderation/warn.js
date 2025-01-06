const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const db = require("quick.db");
const crypto = require("crypto");

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
            const warnID = crypto.randomBytes(4).toString("hex");  // Génère un ID de 8 caractères hexadécimaux

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
    },
};
