// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
const {
	Provider,
	util: { mergeDefault, chunk }
} = require('klasa');
const rethink = require('rethinkdbdash');

module.exports = class extends Provider {
	constructor(...args) {
		super(...args);
		this.enabled = this.client.production;
		this.db = this.client.production
			? rethink(
					mergeDefault(
						{
							db: 'osbot',
							silent: false
						},
						this.client.options.providers.rethinkdb
					)
			  )
			: null;
	}

	async init() {
		const { db } = this.db._poolMaster._options;
		await this.db.branch(this.db.dbList().contains(db), null, this.db.dbCreate(db)).run();
	}

	get exec() {
		return this.db;
	}

	async ping() {
		const now = Date.now();
		return (await this.db.now()) - now;
	}

	async shutdown() {
		if (!this.client.production) return;
		return this.db.getPoolMaster().drain();
	}

	/* Table methods */

	async hasTable(table) {
		return this.db
			.tableList()
			.contains(table)
			.run();
	}

	async createTable(table) {
		return this.db.tableCreate(table).run();
	}

	async deleteTable(table) {
		return this.db.tableDrop(table).run();
	}

	async sync(table) {
		return this.db
			.table(table)
			.sync()
			.run();
	}

	/* Document methods */

	async getAll(table, entries = []) {
		if (entries.length) {
			const chunks = chunk(entries, 50000);
			const output = [];
			for (const myChunk of chunks)
				output.push(
					...(await this.db
						.table(table)
						.getAll(...myChunk)
						.run())
				);
			return output;
		}
		return this.db.table(table).run();
	}

	async getKeys(table, entries = []) {
		if (entries.length) {
			const chunks = chunk(entries, 50000);
			const output = [];
			for (const myChunk of chunks)
				output.push(
					...(await this.db
						.table(table)
						.getAll(...myChunk)('id')
						.run())
				);
			return output;
		}
		return this.db
			.table(table)('id')
			.run();
	}

	async get(table, id) {
		return this.db
			.table(table)
			.get(id)
			.run();
	}

	async has(table, id) {
		return this.db
			.table(table)
			.get(id)
			.ne(null)
			.run();
	}

	async getRandom(table) {
		return this.db
			.table(table)
			.sample(1)
			.run();
	}

	async create(table, id, value = {}) {
		return this.db
			.table(table)
			.insert({ ...this.parseUpdateInput(value), id })
			.run();
	}

	async update(table, id, value = {}) {
		return this.db
			.table(table)
			.get(id)
			.update(this.parseUpdateInput(value))
			.run();
	}

	async replace(table, id, value = {}) {
		return this.db
			.table(table)
			.get(id)
			.replace({ ...this.parseUpdateInput(value), id })
			.run();
	}

	async delete(table, id) {
		return this.db
			.table(table)
			.get(id)
			.delete()
			.run();
	}
};
