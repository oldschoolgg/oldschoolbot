const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

    constructor(...args) {
        super(...args, {
            name: 'aliasInhibitor'
        });
    }

    async run(msg, cmd) {
        const [alias] = message.content.slice(msg.prefixLength).trim().split(' ');
        if (msg.guild.settings.get('disabledAliases').includes(alias)) {
            throw true;
        }
        return 'promise?'
    }
};
