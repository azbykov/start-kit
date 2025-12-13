/**
 * Zod validation schemas for user operations
 */

import { z } from "zod";
import { Role } from "@prisma/client";

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .email("Некорректный формат email")
    .min(1, "Email обязателен для заполнения"),
  name: z.string().max(100, "Имя не должно превышать 100 символов").optional(),
  role: z.nativeEnum(Role, {
    message: "Некорректная роль",
  }),
  isActive: z.boolean().default(true),
});

/**
 * Schema for updating a user
 * Email is NOT included (immutable)
 */
export const updateUserSchema = z.object({
  name: z.string().max(100, "Имя не должно превышать 100 символов").optional(),
  role: z
    .nativeEnum(Role, {
      message: "Некорректная роль",
    })
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(20).max(50).default(25),
});

/**
 * Type inference from schemas
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

