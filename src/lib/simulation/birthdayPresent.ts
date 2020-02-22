import LootTable from 'oldschooljs/dist/structures/LootTable';

const BirthdayPresentTable = new LootTable().oneIn(10, 'War ship').every('Slice of birthday cake');

export default BirthdayPresentTable;
