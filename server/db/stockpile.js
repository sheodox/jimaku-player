const sqlite3 = require('sqlite3'),
	debug = require('debug');

const validateTableName = name => {
	if (!/^[a-z_]+$/.test(name)) {
		throw new Error(`Invalid table name "${name}"`)
	}
};
const validateColumnName = name => {
	if (!/^[a-z_]+$/.test(name)) {
		throw new Error(`Invalid column name "${name}"`)
	}
};
const validateColumnDefinition = name => {
	if (!/^[A-Z ]+$/.test(name)) {
		throw new Error(`Invalid column definition "${name}"`)
	}
};

class Stockpile {
	constructor(options) {
		if (!options.db) {
			throw new Error('Stockpile - missing database name!');
		}

		this.debug = debug(`stockpile:${options.db}`);
		this.options = options;

		this.ready = false;
		this._databaseCreation = new Promise((resolve, reject) => {
			this._db = new sqlite3.Database(`./data/${options.db}.sqlite3`, async err => {
				if (err) {
					throw err;
				}

				//table for StockPile metadata
				await this._callSql('run', `CREATE TABLE IF NOT EXISTS stockpile_meta (key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL)`);

				for (let table of this.options.tables) {
					const columns = Object.keys(table.columns).map(column => {
						validateColumnName(column);
						validateColumnDefinition(table.columns[column]);
						return column + ' ' + table.columns[column];
					}).join(',');

					validateTableName(table.name);
					//skip the queue, this needs to run first
					await this._callSql('run', `CREATE TABLE IF NOT EXISTS ${table.name} (${columns});`);
				}


				for (let migration of (this.options.migrations || []) ) {
					const schemaVersion = parseInt((await this._callSql(`get`, `SELECT value FROM stockpile_meta WHERE key="schema_version"`)).value || 0, 10);
					if (typeof migration.version !== 'number') {
						throw new TypeError(`Stockpile schema version must be a number! (got "${migration.version}")`);
					}

					if (schemaVersion < migration.version) {
						console.log(`Migrating database "${options.db}" to version ${migration.version}`);
						//add new columns, column definitions are found in the schema passed in to the constructor
						for (const column of (migration.addColumns || [])) {
							const table = column.to,
								columnName = column.column,
								columnDefinition = this.options.tables.reduce((found, next) => {
									if (found) return found;

									if (next.name === table) {
										return next.columns[columnName];
									}
								}, null);

							if (!columnDefinition) {
								throw new Error(`Missing column definition for ${columnName} in ${table}.`)
							}

							validateTableName(table);
							validateColumnName(columnName);
							validateColumnDefinition(columnDefinition);

							await this._callSql(`run`, `ALTER TABLE ${table} ADD COLUMN ${columnName} ${columnDefinition}`)
						}
						await this._callSql('run', `INSERT OR REPLACE INTO stockpile_meta (key, value) VALUES (?,?)`, ['schema_version', migration.version])
					}
				}

				this.ready = true;
				resolve();
			});
		});
	}

	/**
	 * Run a function after the database has been initialized. Helpful when you want to do some cleanup or data integrity checks.
	 * @param fn
	 */
	onReady(fn) {
		this._databaseCreation.then(fn);
	}
	_queue(...args) {
		//if queries are called before the database has been created, queue them up in promises, otherwise run them normally
		if (!this.ready) {
			return this._databaseCreation = this._databaseCreation.then(() => {
				this._callSql(...args);
			})
		}
		return this._callSql(...args);
	}
	_callSql(type, sql, params=[]) {
		const startTime = Date.now();
		return new Promise((resolve, reject) => {
			this._db[type](sql, ...params, (err, row) => {
				this.debug(sql, params);
				if (err) {
					reject(err);
					return;
				}
				else if (row) {
					const count = Array.isArray(row) ? row.length : 1;
					this.debug(`${count} results in ${Date.now() - startTime}ms`);
				}
				else {
					this.debug(`0 results in ${Date.now() - startTime}ms`);
				}
				resolve(row);
			})
		})
	}
	get (sql, ...params) {
		return this._queue('get', sql, params);
	}
	all (sql, ...params) {
		return this._queue('all', sql, params);
	}
	run (sql, ...params) {
		return this._queue('run', sql, params);
	}

	/**
	 * Validates data and builds sql and an array to insert an arbitrary object into a database.
	 * @param data - object of column: values to be inserted in the database
	 * @param tableName - table name to validate all column names against
	 * @returns {{sql: string, values: Array}}
	 */
	buildInsertMap(data, tableName) {
		if (!tableName) {
			throw new Error('must specify a table name for buildInsertMap to validate column names');
		}
		const validColumnNames = Object.keys(this.options.tables.find(t => t.name === tableName).columns);
		const columns = [],
			values = [];
		let valuePlaceholders = [];
		let index = 1;
		for (let i in data) {
			const validColumn = validColumnNames.includes(i);
			if (data.hasOwnProperty(i) && validColumn) {
				columns.push(i);
				values.push(data[i]);
				valuePlaceholders.push('?');
				index++;
			}
			else if (!validColumn) {
				this.debug(`invalid column detected in buildInsertMap: "${i}", ignoring`);
			}
		}
		valuePlaceholders = valuePlaceholders.join(',');
		return {
			sql: `(${columns.join(',')}) VALUES (${valuePlaceholders})`,
			values
		}
	}
}


module.exports = Stockpile;
