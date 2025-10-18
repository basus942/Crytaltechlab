import express from "express";
import dotenv from "dotenv";
dotenv.config();

import {
	getAllEmployees,
	getEmployeeById,
	deleteEmployee,
	addEmployee,
	updateEmployee,
	login,
} from "./controller/employee.js";

const app = express();
app.use(express.json());

app.get("/employees", getAllEmployees);
app.get("/employee/:id", getEmployeeById);
app.delete("/employee/:id", deleteEmployee);
app.post("/employee", addEmployee);
app.put("/employee/:id", updateEmployee);
app.post("/login", login);

app.use((err, req, res, next) => {
	console.error(err);
	const statusCode = err.status || 500;
	res.status(statusCode).json({
		success: false,
		statusCode,
		message: err.message || "Internal Server Error",
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
	console.log(`App started on port ${PORT}`)
);
