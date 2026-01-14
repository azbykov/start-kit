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
  contactPhone: z.string().max(50, "Телефон слишком длинный").optional().nullable(),
  contactEmail: z.string().email("Неверный email").max(200, "Email слишком длинный").optional().nullable(),
  contactWebsite: z
    .string()
    .url("Неверный URL сайта")
    .max(300, "URL слишком длинный")
    .optional()
    .nullable()
    .or(z.literal("")),
  contactAddress: z.string().max(300, "Адрес слишком длинный").optional().nullable(),
  contactTelegram: z.string().max(100, "Telegram слишком длинный").optional().nullable(),
  contactVk: z
    .string()
    .max(200, "Ссылка VK слишком длинная")
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
  contactPhone: z.string().max(50, "Телефон слишком длинный").optional().nullable(),
  contactEmail: z.string().email("Неверный email").max(200, "Email слишком длинный").optional().nullable(),
  contactWebsite: z
    .string()
    .url("Неверный URL сайта")
    .max(300, "URL слишком длинный")
    .optional()
    .nullable()
    .or(z.literal("")),
  contactAddress: z.string().max(300, "Адрес слишком длинный").optional().nullable(),
  contactTelegram: z.string().max(100, "Telegram слишком длинный").optional().nullable(),
  contactVk: z
    .string()
    .max(200, "Ссылка VK слишком длинная")
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
  contactPhone: z.string().max(50, "Телефон слишком длинный").optional(),
  contactEmail: z.string().email("Неверный email").max(200, "Email слишком длинный").optional().or(z.literal("")),
  contactWebsite: z.string().url("Неверный URL сайта").max(300, "URL слишком длинный").optional().or(z.literal("")),
  contactAddress: z.string().max(300, "Адрес слишком длинный").optional(),
  contactTelegram: z.string().max(100, "Telegram слишком длинный").optional(),
  contactVk: z.string().max(200, "Ссылка VK слишком длинная").optional(),
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

