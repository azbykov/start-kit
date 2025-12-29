/**
 * Zod validation schemas for tournament operations
 */

import { z } from "zod";

const tournamentStatusSchema = z.enum([
  "PLANNED",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
]);

const participantGenderSchema = z.enum(["MALE", "FEMALE", "MIXED"]);

const birthYearSchema = z.preprocess(
  (value) => {
    if (value === "") return undefined;
    return value;
  },
  z
    .union([z.coerce.number().int().min(1900).max(2100), z.null()])
    .optional()
) as z.ZodType<number | null | undefined>;

const optionalBirthYearStringSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      if (!/^\d{4}$/.test(value)) return false;
      const year = Number(value);
      return year >= 1900 && year <= 2100;
    },
    { message: "Некорректный год рождения" }
  );

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
    organizer: z
      .string()
      .max(200, "Организатор слишком длинный")
      .optional()
      .nullable(),
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
    sport: z
      .string()
      .max(100, "Вид спорта слишком длинный")
      .optional()
      .nullable(),
    format: z
      .string()
      .max(50, "Формат слишком длинный")
      .optional()
      .nullable(),
    gender: participantGenderSchema.optional().nullable(),
    ageGroup: z
      .string()
      .max(100, "Возрастная группа слишком длинная")
      .optional()
      .nullable(),
    birthYearFrom: birthYearSchema,
    birthYearTo: birthYearSchema,
    status: tournamentStatusSchema.optional().default("ACTIVE"),
    logo: z
      .string()
      .url("Неверный URL логотипа")
      .optional()
      .nullable()
      .or(z.literal("")),
    startDate: z
      .union([
        z.date({
          message: "Некорректная дата начала",
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
          message: "Некорректная дата окончания",
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
  )
  .refine(
    (data) => {
      if (
        data.birthYearFrom !== undefined &&
        data.birthYearFrom !== null &&
        data.birthYearTo !== undefined &&
        data.birthYearTo !== null
      ) {
        return data.birthYearFrom <= data.birthYearTo;
      }
      return true;
    },
    {
      message: "Год рождения «с» должен быть меньше или равен «по»",
      path: ["birthYearTo"],
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
    organizer: z
      .string()
      .max(200, "Организатор слишком длинный")
      .optional()
      .nullable(),
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
    sport: z
      .string()
      .max(100, "Вид спорта слишком длинный")
      .optional()
      .nullable(),
    format: z
      .string()
      .max(50, "Формат слишком длинный")
      .optional()
      .nullable(),
    gender: participantGenderSchema.optional().nullable(),
    ageGroup: z
      .string()
      .max(100, "Возрастная группа слишком длинная")
      .optional()
      .nullable(),
    birthYearFrom: birthYearSchema,
    birthYearTo: birthYearSchema,
    status: tournamentStatusSchema.optional(),
    logo: z
      .string()
      .url("Неверный URL логотипа")
      .optional()
      .nullable()
      .or(z.literal("")),
    startDate: z
      .union([
        z.date({
          message: "Некорректная дата начала",
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
          message: "Некорректная дата окончания",
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
  )
  .refine(
    (data) => {
      if (
        data.birthYearFrom !== undefined &&
        data.birthYearFrom !== null &&
        data.birthYearTo !== undefined &&
        data.birthYearTo !== null
      ) {
        return data.birthYearFrom <= data.birthYearTo;
      }
      return true;
    },
    {
      message: "Год рождения «с» должен быть меньше или равен «по»",
      path: ["birthYearTo"],
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
    organizer: z.string().max(200, "Организатор слишком длинный").optional(),
    description: z
      .string()
      .max(5000, "Описание слишком длинное (максимум 5000 символов)")
      .optional(),
    season: z.string().max(50, "Сезон слишком длинный").optional(),
    location: z.string().max(200, "Локация слишком длинная").optional(),
    sport: z.string().max(100, "Вид спорта слишком длинный").optional(),
    format: z.string().max(50, "Формат слишком длинный").optional(),
    gender: participantGenderSchema.optional(),
    ageGroup: z
      .string()
      .max(100, "Возрастная группа слишком длинная")
      .optional(),
    birthYearFrom: optionalBirthYearStringSchema,
    birthYearTo: optionalBirthYearStringSchema,
    status: tournamentStatusSchema.optional().default("ACTIVE"),
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
  )
  .refine(
    (data) => {
      if (data.birthYearFrom && data.birthYearTo) {
        return Number(data.birthYearFrom) <= Number(data.birthYearTo);
      }
      return true;
    },
    {
      message: "Год рождения «с» должен быть меньше или равен «по»",
      path: ["birthYearTo"],
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

