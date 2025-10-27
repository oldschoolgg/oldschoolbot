export const FormattedCustomEmoji = /<a?:\w{2,32}:\d{17,20}>/;

export const ParsedCustomEmojiWithGroups = /(?<animated>a?):(?<name>[^:]+):(?<id>\d{17,20})/;
