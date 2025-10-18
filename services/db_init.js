import { Pool } from "pg";

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: "postgres",
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
});

pool
	.connect()
	.then(() => console.log("db connected"))
	.catch((err) => console.log({ err }));

export default pool;
