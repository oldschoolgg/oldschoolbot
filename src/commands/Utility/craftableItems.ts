const items = [
    {
        inputItems: ['Godsword shard 1', 'Godsword shard 2', 'Godsword shard 3'],
        outputItem: 'Godsword blade',
        /*skillRequirements = { smithing: 80 }*/
    },
    {
        inputItems: ['Godsword blade', 'Armadyl hilt'],
        outputItem: 'Armadyl godsword',
    },
    {
        inputItems: ['Godsword blade', 'Bandos hilt'],
        outputItem: 'Bandos Godsword',
    },
    {
        inputItems: ['Godsword blade', 'Saradomin hilt'],
        outputItem: 'Saradomin godsword',
    },
    {
        inputItems: ['Draconic visage'],
        outputItem: 'Dragonfire shield',
        /* skillRequirements = { smithing: 90 }*/
    },
    {
        inputItems: ['Skeletal visage'],
        outputItem: 'Dragonfire ward',
        /* skillRequirements = { smithing: 90 }*/
    },
    {
        inputItems: ['Elysian sigil', 'Spirit shield', 'Holy elixir'],
        outputItem: 'Elysian Spirit Shield',
        /* skillRequirements = { smithing: 85, prayer: 90 }*/
    },
    {
        inputItems: ['Arcane sigil', 'Spirit shield', 'Holy elixir'],
        outputItem: 'Arcane Spirit Shield',
        /* skillRequirements = { smithing: 85, prayer: 90 }*/
    },
    {
        inputItems: ['Spectral sigil', 'Spirit shield', 'Holy elixir'],
        outputItem: 'Spectral Spirit Shield',
        /* skillRequirements = { smithing: 85, prayer: 90 }*/
    },
    {
        inputItems: ['Tanzanite fang'],
        outputItem: 'Toxic blowpipe (empty)',
        /*skillRequirements = { fletching: 53 }*/
    },
    {
        inputItems: ['Serpentine visage'],
        outputItem: 'Serpentine helm (uncharged)',
        /* skillRequirements = { fletching: 52 }*/
    },
    {
        inputItems: ['Staff of the dead', 'Magic fang'],
        outputItem: 'Toxic staff (uncharged)',
        /* skillRequirements = { crafting: 59 }*/
    },
    {
        inputItems: ['Serpentine helm (uncharged)', 'Magma mutagen'],
        outputItem: 'Magma helm (uncharged)',
    },
    {
        inputItems: ['Serpentine helm(uncharged)', 'Tanzanite mutagen'],
        outputItem: 'Tanzanite helm (uncharged)',
    },
    {
        inputItems: ['Ranger boots', 'Pegasian crystal'],
        outputItem: 'Pegasian boots',
        /*skillRequirements = { magic: 60, runecraft: 60 }*/
    },
    {
        inputItems: ['Saradomin page 1', 'Saradomin page 2', 'Saradomin page 3', 'Saradomin page 4'],
        outputItem: 'Holy book',
    },
    {
        inputItems: ['Zamorak page 1', 'Zamorak page 2', 'Zamorak page 3', 'Zamorak page 4'],
        outputItem: 'Unholy book',
    },
    {
        inputItems: ['Guthix page 1', 'Guthix page 2', 'Guthix page 3', 'Guthix page 4'],
        outputItem: 'Book of balance',
    },
    {
        inputItems: ['Bandos page 1', 'Bandos page 2', 'Bandos page 3', 'Bandos page 4'],
        outputItem: 'Book of war',
    },
    {
        inputItems: ['Armadyl page 1', 'Armadyl page 2', 'Armadyl page 3', 'Armadyl page 4'],
        outputItem: 'Book of law',
    },
    {
        inputItems: ['Ancient page 1', 'Ancient page 2', 'Ancient page 3', 'Ancient page 4'],
        outputItem: 'Book of darkness',
    },
    {
        inputItems: [' Malediction shard 1', ' Malediction shard 2', ' Malediction shard 3'],
        outputItem: 'Malediction ward',
    },
    {
        inputItems: ['Odium shard 1', 'Odium shard 2', 'Odium shard 3'],
        outputItem: 'Odium ward',
    },
    {
        inputItems: ["Saradomin's light", 'Staff of the dead'],
        outputItem: 'Staff of light',
    }
]
const craftableItems = {
    Items: items
};

export default craftableItems;
