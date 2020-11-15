require('dotenv').config();

module.exports = {
	type: 'postgres',
	host: process.env.PGHOST || 'postgres',
	port: process.env.PGPORT || 5432,
	username: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	database: process.env.PGDATABASE,
	synchronize: false,
	entities: [
		'server/entity/**/*.js'
	],
	migrations: [
		'server/migration/**/*.js'
	],
	cli: {
		entitiesDir: 'server/entity',
		migrationsDir: 'server/migration',
	}
}