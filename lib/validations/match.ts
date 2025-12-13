/**
 * Zod validation schemas for match operations
 */

import { z } from "zod";

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(25),
});

/**
 * Match status enum
 */
export const matchStatusSchema = z.enum([
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "CANCELLED",
]);

/**
 * Schema for time format (HH:MM)
 */
const timeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Неверный формат времени (HH:MM)")
  .optional()
  .nullable();

/**
 * Schema for creating a new match
 */
export const createMatchSchema = z
  .object({
    date: z.union([
      z.date({
        invalid_type_error: "Некорректная дата",
      }),
      z.string().transform((str) => {
        if (!str) throw new Error("Дата обязательна");
        const date = new Date(str);
        if (isNaN(date.getTime())) {
          throw new Error("Некорректная дата");
        }
        return date;
      }),
    ]),
    time: timeSchema,
    stadium: z
      .string()
      .max(200, "Название стадиона слишком длинное")
      .optional()
      .nullable(),
    status: matchStatusSchema.default("SCHEDULED"),
    homeTeamId: z.string().min(1, "Команда хозяев обязательна"),
    awayTeamId: z.string().min(1, "Команда гостей обязательна"),
    homeScore: z
      .number()
      .int()
      .min(0, "Счет не может быть отрицательным")
      .optional()
      .nullable(),
    awayScore: z
      .number()
      .int()
      .min(0, "Счет не может быть отрицательным")
      .optional()
      .nullable(),
    tournamentId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      return data.homeTeamId !== data.awayTeamId;
    },
    {
      message: "Команды должны быть разными",
      path: ["awayTeamId"],
    }
  )
  .refine(
    (data) => {
      if (data.status === "SCHEDULED") {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const matchDate = new Date(data.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate >= now;
      }
      return true;
    },
    {
      message: "Дата запланированного матча не может быть в прошлом",
      path: ["date"],
    }
  );

/**
 * Schema for updating a match (all fields optional)
 */
export const updateMatchSchema = z
  .object({
    date: z
      .union([
        z.date({
          invalid_type_error: "Некорректная дата",
        }),
        z.string().transform((str) => {
          if (!str) return undefined;
          const date = new Date(str);
          if (isNaN(date.getTime())) {
            throw new Error("Некорректная дата");
          }
          return date;
        }),
      ])
      .optional(),
    time: timeSchema,
    stadium: z
      .string()
      .max(200, "Название стадиона слишком длинное")
      .optional()
      .nullable(),
    status: matchStatusSchema.optional(),
    homeTeamId: z.string().min(1, "Команда хозяев обязательна").optional(),
    awayTeamId: z.string().min(1, "Команда гостей обязательна").optional(),
    homeScore: z
      .number()
      .int()
      .min(0, "Счет не может быть отрицательным")
      .optional()
      .nullable(),
    awayScore: z
      .number()
      .int()
      .min(0, "Счет не может быть отрицательным")
      .optional()
      .nullable(),
    tournamentId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.homeTeamId && data.awayTeamId) {
        return data.homeTeamId !== data.awayTeamId;
      }
      return true;
    },
    {
      message: "Команды должны быть разными",
      path: ["awayTeamId"],
    }
  )
  .refine(
    (data) => {
      if (data.status === "SCHEDULED" && data.date) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const matchDate = new Date(data.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate >= now;
      }
      return true;
    },
    {
      message: "Дата запланированного матча не может быть в прошлом",
      path: ["date"],
    }
  );

/**
 * Schema for form input (strings for dates)
 */
export const createMatchFormSchema = z
  .object({
    date: z.string().min(1, "Дата обязательна"),
    time: z
      .string()
      .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Неверный формат времени (HH:MM)")
      .optional()
      .or(z.literal("")),
    stadium: z.string().max(200, "Название стадиона слишком длинное").optional(),
    status: matchStatusSchema.default("SCHEDULED"),
    homeTeamId: z.string().min(1, "Команда хозяев обязательна"),
    awayTeamId: z.string().min(1, "Команда гостей обязательна"),
    homeScore: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val === "") return null;
        const num = parseInt(val, 10);
        return isNaN(num) ? null : num;
      }),
    awayScore: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val === "") return null;
        const num = parseInt(val, 10);
        return isNaN(num) ? null : num;
      }),
    tournamentId: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      return data.homeTeamId !== data.awayTeamId;
    },
    {
      message: "Команды должны быть разными",
      path: ["awayTeamId"],
    }
  )
  .refine(
    (data) => {
      if (data.status === "SCHEDULED") {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const matchDate = new Date(data.date);
        if (isNaN(matchDate.getTime())) {
          return true; // Let individual date validation handle errors
        }
        matchDate.setHours(0, 0, 0, 0);
        return matchDate >= now;
      }
      return true;
    },
    {
      message: "Дата запланированного матча не может быть в прошлом",
      path: ["date"],
    }
  );

export const updateMatchFormSchema = createMatchFormSchema.partial();

/**
 * Schema for adding a player to a match
 */
export const addMatchPlayerSchema = z.object({
  playerId: z.string().min(1, "Игрок обязателен"),
  teamId: z.string().min(1, "Команда обязательна"),
  goals: z.coerce.number().int().min(0).default(0),
  assists: z.coerce.number().int().min(0).default(0),
  yellowCards: z.coerce.number().int().min(0).default(0),
  redCards: z.coerce.number().int().min(0).max(1).default(0),
  minutesPlayed: z.coerce.number().int().min(0).max(120).default(0),
  isStarter: z.boolean().default(false),
});

/**
 * Schema for updating player statistics in a match
 */
export const updateMatchPlayerSchema = z.object({
  goals: z.coerce.number().int().min(0).optional(),
  assists: z.coerce.number().int().min(0).optional(),
  yellowCards: z.coerce.number().int().min(0).optional(),
  redCards: z.coerce.number().int().min(0).max(1).optional(),
  minutesPlayed: z.coerce.number().int().min(0).max(120).optional(),
  isStarter: z.boolean().optional(),
});

/**
 * Type inference from schemas
 */
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type CreateMatchFormInput = z.infer<typeof createMatchFormSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type UpdateMatchFormInput = z.infer<typeof updateMatchFormSchema>;
export type AddMatchPlayerInput = z.infer<typeof addMatchPlayerSchema>;
export type UpdateMatchPlayerInput = z.infer<typeof updateMatchPlayerSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

