const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            cooldown: 2,
            subcommands: true,
            description: 'Enable and Disable certain command aliases in your guild. Admins only.',
            usage: '<enable|disable> <alias:alias>',
            usageDelim: ' ',
            permissionLevel: 7
        });
    }

    async enable(msg, [alias]) {
        if (!msg.guild.settings.get('disabledAliases').includes(alias.name)) {
            return msg.sendLocale('ALIAS_ISNT_DISABLED');
        }
        await msg.guild.settings.update('disabledAliases', alias.name, { action: 'remove' });
        return msg.sendLocale('ALIAS_ENABLED', [alias.name]);
    }

    async disable(msg, [alias]) {
        if (msg.guild.settings.get('disabledAliases').includes(alias.name)) {
            return msg.sendLocale('ALIAS_ALREADY_DISABLED');
        }
        await msg.guild.settings.update('disabledAliases', alias.name, { action: 'add' });
        return msg.sendLocale('ALIAS_DISABLED', [alias.name]);
    }

};
