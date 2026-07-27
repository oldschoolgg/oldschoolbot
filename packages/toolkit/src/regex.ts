export const FormattedCustomEmoji: RegExp = /<a?:\w{2,32}:\d{17,20}>/;

export const ParsedCustomEmojiWithGroups: RegExp = /(?<animated>a?):(?<name>[^:]+):(?<id>\d{17,20})/;
