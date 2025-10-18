import pool from "../services/db_init.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
	employeeSchema,
	loginSchema,
} from "../services/validation_schema.js";

const JWTSECRECT = process.env.JWTSECRECT;

export const getAllEmployees = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const offset = (page - 1) * limit;

		const data = await pool.query(
			`SELECT count(*) OVER() as total_record, id, name, email, phone, salary, created_at 
			 FROM employees WHERE is_deleted=false 
			 LIMIT $1 OFFSET $2`,
			[limit, offset]
		);

		const responseData = {
			meta: {
				pagination: true,
				total_records: data.rows[0]?.total_record || 0,
			},
			data: data.rows,
		};

		res.status(200).json({
			success: true,
			message: "Fetched All Employees Successfully",
			...responseData,
		});
	} catch (error) {
		next(new Error("Cannot fetch all employees"));
	}
};

export const getEmployeeById = async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		const data = await pool.query(
			`SELECT id, name, email, phone, salary, created_at 
			 FROM employees WHERE is_deleted=false AND id=$1`,
			[id]
		);

		if (data.rowCount === 0) {
			const error = new Error("No employee found");
			error.status = 404;
			throw error;
		}

		res.status(200).json({
			success: true,
			message: "Fetched Employee details Successfully",
			meta: { pagination: false },
			data: data.rows[0],
		});
	} catch (error) {
		next(error);
	}
};

export const deleteEmployee = async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		await pool.query(
			`UPDATE employees SET is_deleted=true WHERE id=$1`,
			[id]
		);
		res.status(200).json({
			success: true,
			message: "Employee Deleted Successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const addEmployee = async (req, res, next) => {
	try {
		const body = await employeeSchema.parseAsync(req.body);

		const salt = bcrypt.genSaltSync(5);
		const hash = bcrypt.hashSync(body.password, salt);

		await pool.query(
			`INSERT INTO employees (name, email, phone, salary, password) VALUES ($1,$2,$3,$4,$5)`,
			[body.name, body.email, body.phone, body.salary, hash]
		);

		res.status(200).json({
			success: true,
			message: "Added Employee Successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const updateEmployee = async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		const body = req.body;

		const salt = bcrypt.genSaltSync(5);
		const hash = bcrypt.hashSync(body.password, salt);

		await pool.query(
			`UPDATE employees SET name=$1, email=$2, phone=$3, salary=$4, password=$5 
			 WHERE is_deleted=false AND id=$6`,
			[
				body.name,
				body.email,
				body.phone,
				body.salary,
				hash,
				id,
			]
		);

		res.status(200).json({
			success: true,
			message: "Updated Employee Successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const { email, password } =
			await loginSchema.parseAsync(req.body);

		const result = await pool.query(
			`SELECT id, name, email, phone, salary, created_at, password 
			 FROM employees WHERE email=$1`,
			[email]
		);

		const user = result.rows[0];
		if (!user) {
			const error = new Error("Invalid email or password");
			error.status = 400;
			throw error;
		}

		const isMatch = bcrypt.compareSync(
			password,
			user.password
		);
		if (!isMatch) {
			const error = new Error("Invalid email or password");
			error.status = 400;
			throw error;
		}
		const accessToken = jwt.sign(
			{ id: user.id },
			JWTSECRECT,
			{ expiresIn: "1h" }
		);
		delete user.password;

		res.status(200).json({
			success: true,
			message: "Logged In Successfully",
			data: { accessToken, user },
		});
	} catch (error) {
		next(error);
	}
};
