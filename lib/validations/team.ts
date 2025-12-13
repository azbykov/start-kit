/**
 * Zod validation schemas for team operations
 */

import { z } from "zod";

/**
 * Schema for pagination parameters (reused from tournaments)
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(25),
});

/**
 * Schema for creating a new team
 */
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Название команды обязательно")
    .max(200, "Название слишком длинное"),
  logo: z
    .string()
    .url("Неверный URL логотипа")
    .optional()
    .nullable()
    .or(z.literal("")),
  coach: z
    .string()
    .max(200, "Имя тренера слишком длинное")
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, "Название города слишком длинное")
    .optional()
    .nullable(),
  country: z
    .string()
    .max(100, "Название страны слишком длинное")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

/**
 * Schema for updating a team (all fields optional)
 */
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Название команды обязательно")
    .max(200, "Название слишком длинное")
    .optional(),
  logo: z
    .string()
    .url("Неверный URL логотипа")
    .optional()
    .nullable()
    .or(z.literal("")),
  coach: z
    .string()
    .max(200, "Имя тренера слишком длинное")
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, "Название города слишком длинное")
    .optional()
    .nullable(),
  country: z
    .string()
    .max(100, "Название страны слишком длинное")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for form input
 */
export const createTeamFormSchema = z.object({
  name: z
    .string()
    .min(1, "Название команды обязательно")
    .max(200, "Название слишком длинное"),
  logo: z.string().url("Неверный URL логотипа").optional().or(z.literal("")),
  coach: z.string().max(200, "Имя тренера слишком длинное").optional(),
  city: z.string().max(100, "Название города слишком длинное").optional(),
  country: z.string().max(100, "Название страны слишком длинное").optional(),
  isActive: z.boolean().default(true),
});

export const updateTeamFormSchema = createTeamFormSchema.partial();

/**
 * Type inference from schemas
 */
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreateTeamFormInput = z.infer<typeof createTeamFormSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type UpdateTeamFormInput = z.infer<typeof updateTeamFormSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

