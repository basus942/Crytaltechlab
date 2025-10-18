import { z } from "zod";

export const employeeSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	phone: z.string(),
	salary: z.number(),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});
