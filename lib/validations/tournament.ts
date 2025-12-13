/**
 * Zod validation schemas for tournament operations
 */

import { z } from "zod";

/**
 * Schema for pagination parameters (reused from players)
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(25),
});

/**
 * Schema for creating a new tournament
 */
export const createTournamentSchema = z
  .object({
    name: z
      .string()
      .min(1, "Название турнира обязательно")
      .max(200, "Название слишком длинное"),
    description: z
      .string()
      .max(5000, "Описание слишком длинное (максимум 5000 символов)")
      .optional()
      .nullable(),
    season: z
      .string()
      .max(50, "Сезон слишком длинный")
      .optional()
      .nullable(),
    location: z
      .string()
      .max(200, "Локация слишком длинная")
      .optional()
      .nullable(),
    logo: z
      .string()
      .url("Неверный URL логотипа")
      .optional()
      .nullable()
      .or(z.literal("")),
    startDate: z
      .union([
        z.date({
          invalid_type_error: "Некорректная дата начала",
        }),
        z.string().transform((str) => {
          if (!str) return undefined;
          const date = new Date(str);
          if (isNaN(date.getTime())) {
            throw new Error("Некорректная дата начала");
          }
          return date;
        }),
      ])
      .optional()
      .nullable(),
    endDate: z
      .union([
        z.date({
          invalid_type_error: "Некорректная дата окончания",
        }),
        z.string().transform((str) => {
          if (!str) return undefined;
          const date = new Date(str);
          if (isNaN(date.getTime())) {
            throw new Error("Некорректная дата окончания");
          }
          return date;
        }),
      ])
      .optional()
      .nullable(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "Дата начала должна быть раньше или равна дате окончания",
      path: ["endDate"],
    }
  );

/**
 * Schema for updating a tournament (all fields optional)
 */
export const updateTournamentSchema = z
  .object({
    name: z
      .string()
      .min(1, "Название турнира обязательно")
      .max(200, "Название слишком длинное")
      .optional(),
    description: z
      .string()
      .max(5000, "Описание слишком длинное (максимум 5000 символов)")
      .optional()
      .nullable(),
    season: z
      .string()
      .max(50, "Сезон слишком длинный")
      .optional()
      .nullable(),
    location: z
      .string()
      .max(200, "Локация слишком длинная")
      .optional()
      .nullable(),
    logo: z
      .string()
      .url("Неверный URL логотипа")
      .optional()
      .nullable()
      .or(z.literal("")),
    startDate: z
      .union([
        z.date({
          invalid_type_error: "Некорректная дата начала",
        }),
        z.string().transform((str) => {
          if (!str) return undefined;
          const date = new Date(str);
          if (isNaN(date.getTime())) {
            throw new Error("Некорректная дата начала");
          }
          return date;
        }),
      ])
      .optional()
      .nullable(),
    endDate: z
      .union([
        z.date({
          invalid_type_error: "Некорректная дата окончания",
        }),
        z.string().transform((str) => {
          if (!str) return undefined;
          const date = new Date(str);
          if (isNaN(date.getTime())) {
            throw new Error("Некорректная дата окончания");
          }
          return date;
        }),
      ])
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "Дата начала должна быть раньше или равна дате окончания",
      path: ["endDate"],
    }
  );

/**
 * Schema for form input (strings for dates)
 */
export const createTournamentFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Название турнира обязательно")
      .max(200, "Название слишком длинное"),
    description: z
      .string()
      .max(5000, "Описание слишком длинное (максимум 5000 символов)")
      .optional(),
    season: z.string().max(50, "Сезон слишком длинный").optional(),
    location: z.string().max(200, "Локация слишком длинная").optional(),
    logo: z.string().url("Неверный URL логотипа").optional().or(z.literal("")),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return true; // Let individual date validation handle errors
        }
        return start <= end;
      }
      return true;
    },
    {
      message: "Дата начала должна быть раньше или равна дате окончания",
      path: ["endDate"],
    }
  );

export const updateTournamentFormSchema = createTournamentFormSchema.partial();

/**
 * Type inference from schemas
 */
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type CreateTournamentFormInput = z.infer<
  typeof createTournamentFormSchema
>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
export type UpdateTournamentFormInput = z.infer<
  typeof updateTournamentFormSchema
>;
export type PaginationInput = z.infer<typeof paginationSchema>;

