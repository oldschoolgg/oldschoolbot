const { Client } = require('klasa');

Client.defaultTextChannelSchema.add('onlyStaffCanUseCommands', 'boolean', { default: false });
