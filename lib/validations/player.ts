/**
 * Zod validation schemas for player operations
 */

import { z } from "zod";
import { Position } from "@prisma/client";

/**
 * Schema for creating a new player
 */
export const createPlayerSchema = z.object({
  firstName: z
    .string()
    .min(1, "Имя обязательно")
    .max(100, "Имя слишком длинное"),
  lastName: z
    .string()
    .min(1, "Фамилия обязательна")
    .max(100, "Фамилия слишком длинная"),
  position: z
    .array(z.nativeEnum(Position, {
      message: "Неверная позиция",
    }))
    .min(1, "Выберите хотя бы одну позицию"),
  dateOfBirth: z
    .union([
      z.date({
        message: "Некорректная дата рождения",
      }),
      z.string().transform((str) => {
        const date = new Date(str);
        if (isNaN(date.getTime())) {
          throw new Error("Некорректная дата рождения");
        }
        return date;
      }),
    ])
    .refine(
      (date) => date <= new Date(),
      "Дата рождения не может быть в будущем"
    )
    .refine(
      (date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 5 && age <= 50; // Reasonable age range for youth football
      },
      "Неверный возраст игрока"
    ),
  teamId: z.string().optional(),
  image: z.string().url("Неверный URL изображения").optional().or(z.literal("")),
  rating: z.number().int().min(0).max(100).optional().default(0),
  marketValue: z.number().min(0, "Рыночная стоимость не может быть отрицательной").optional(),
  contractExpires: z
    .union([
      z.date(),
      z.string().transform((str) => {
        const date = new Date(str);
        if (isNaN(date.getTime())) {
          throw new Error("Некорректная дата окончания контракта");
        }
        return date;
      }),
    ])
    .optional(),
  totalMatches: z.number().int().min(0).max(1000).default(0),
  totalGoals: z.number().int().min(0).max(500).default(0),
  totalAssists: z.number().int().min(0).max(500).default(0),
  totalMinutes: z.number().int().min(0).max(100000).default(0),
  videoLinks: z
    .array(z.string().url("Неверный URL"))
    .max(15, "Максимум 15 видео-ссылок")
    .default([]),
});

/**
 * Schema for updating a player (API - accepts Date or string)
 */
export const updatePlayerSchema = z.object({
  firstName: z
    .string()
    .min(1, "Имя обязательно")
    .max(100, "Имя слишком длинное")
    .optional(),
  lastName: z
    .string()
    .min(1, "Фамилия обязательна")
    .max(100, "Фамилия слишком длинная")
    .optional(),
  position: z
    .array(z.nativeEnum(Position, {
      message: "Неверная позиция",
    }))
    .min(1, "Выберите хотя бы одну позицию")
    .optional(),
  dateOfBirth: z
    .union([
      z.date({
        message: "Некорректная дата рождения",
      }),
      z.string().transform((str) => {
        const date = new Date(str);
        if (isNaN(date.getTime())) {
          throw new Error("Некорректная дата рождения");
        }
        return date;
      }),
    ])
    .refine(
      (date) => date <= new Date(),
      "Дата рождения не может быть в будущем"
    )
    .refine(
      (date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 5 && age <= 50;
      },
      "Неверный возраст игрока"
    )
    .optional(),
  teamId: z.string().nullable().optional(),
  image: z.string().url("Неверный URL изображения").optional().or(z.literal("")).nullable(),
  rating: z.number().int().min(0).max(100).optional(),
  marketValue: z.number().min(0, "Рыночная стоимость не может быть отрицательной").optional().nullable(),
  contractExpires: z
    .union([
      z.date(),
      z.string().transform((str) => {
        const date = new Date(str);
        if (isNaN(date.getTime())) {
          throw new Error("Некорректная дата окончания контракта");
        }
        return date;
      }),
    ])
    .optional()
    .nullable(),
  totalMatches: z.number().int().min(0).max(1000).optional(),
  totalGoals: z.number().int().min(0).max(500).optional(),
  totalAssists: z.number().int().min(0).max(500).optional(),
  totalMinutes: z.number().int().min(0).max(100000).optional(),
  videoLinks: z
    .array(z.string().url("Неверный URL"))
    .max(15, "Максимум 15 видео-ссылок")
    .optional(),
});

/**
 * Schema for client-side edit form (dateOfBirth as string)
 */
export const updatePlayerFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "Имя обязательно")
    .max(100, "Имя слишком длинное")
    .optional(),
  lastName: z
    .string()
    .min(1, "Фамилия обязательна")
    .max(100, "Фамилия слишком длинная")
    .optional(),
  position: z
    .array(z.nativeEnum(Position, {
      message: "Неверная позиция",
    }))
    .min(1, "Выберите хотя бы одну позицию")
    .optional(),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (str) => {
        if (!str) return true;
        const date = new Date(str);
        return !isNaN(date.getTime());
      },
      "Некорректная дата рождения"
    )
    .refine(
      (str) => {
        if (!str) return true;
        const date = new Date(str);
        return date <= new Date();
      },
      "Дата рождения не может быть в будущем"
    )
    .refine(
      (str) => {
        if (!str) return true;
        const date = new Date(str);
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 5 && age <= 50;
      },
      "Неверный возраст игрока"
    ),
  teamId: z.string().optional(),
  image: z.string().url("Неверный URL изображения").optional().or(z.literal("")),
  rating: z
    .string()
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        const n = Number(v);
        return Number.isInteger(n) && n >= 0 && n <= 100;
      },
      "Рейтинг должен быть числом от 0 до 100"
    ),
  marketValue: z.string().optional(),
  contractExpires: z
    .string()
    .optional()
    .refine(
      (str) => {
        if (!str) return true;
        const date = new Date(str);
        return !isNaN(date.getTime());
      },
      "Некорректная дата окончания контракта"
    ),
  totalMatches: z.string().optional(),
  totalGoals: z.string().optional(),
  totalAssists: z.string().optional(),
  totalMinutes: z.string().optional(),
  videoLinks: z
    .array(z.string().url("Неверный URL"))
    .max(15, "Максимум 15 видео-ссылок")
    .optional(),
});

/**
 * Schema for client-side form (dateOfBirth as string for input type="date")
 */
export const createPlayerFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "Имя обязательно")
    .max(100, "Имя слишком длинное"),
  lastName: z
    .string()
    .min(1, "Фамилия обязательна")
    .max(100, "Фамилия слишком длинная"),
  position: z
    .array(z.nativeEnum(Position, {
      message: "Неверная позиция",
    }))
    .min(1, "Выберите хотя бы одну позицию"),
  dateOfBirth: z
    .string()
    .min(1, "Дата рождения обязательна")
    .refine(
      (str) => {
        const date = new Date(str);
        return !isNaN(date.getTime());
      },
      "Некорректная дата рождения"
    )
    .refine(
      (str) => {
        const date = new Date(str);
        return date <= new Date();
      },
      "Дата рождения не может быть в будущем"
    )
    .refine(
      (str) => {
        const date = new Date(str);
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 5 && age <= 50;
      },
      "Неверный возраст игрока"
    ),
  teamId: z.string().optional(),
  rating: z
    .string()
    .optional()
    .default("0")
    .refine(
      (v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 0 && n <= 100;
      },
      "Рейтинг должен быть числом от 0 до 100"
    ),
  totalMatches: z.string().default("0"),
  totalGoals: z.string().default("0"),
  totalAssists: z.string().default("0"),
  totalMinutes: z.string().default("0"),
  videoLinks: z
    .array(z.string().url("Неверный URL"))
    .max(15, "Максимум 15 видео-ссылок")
    .default([]),
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
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type CreatePlayerFormInput = z.infer<typeof createPlayerFormSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type UpdatePlayerFormInput = z.infer<typeof updatePlayerFormSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

