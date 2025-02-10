// src/types/api.ts
import { z } from 'zod';

export const WeekDayEnum = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
} as const;

export type WeekDay = (typeof WeekDayEnum)[keyof typeof WeekDayEnum];

export const RestaurantSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  taps: z.string().optional(),
  linkMaps: z.string(),
  owner: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional(),
  }),
  cover: z
    .object({
      id: z.number(),
      name: z.string(),
      url: z.string(),
      formats: z.object({
        small: z.object({
          url: z.string(),
        }),
        thumbnail: z.object({
          url: z.string(),
        }),
      }),
    })
    .optional(),
});

export const ScheduleSchema = z.object({
  id: z.number(),
  day: z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
  startTime: z.string(),
  endTime: z.string(),
});

export const EmployeeSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  position: z.string(),
  active: z.boolean(),
  photo: z
    .object({
      id: z.number(),
      url: z.string(),
      formats: z.object({
        thumbnail: z.object({
          url: z.string(),
        }),
      }),
    })
    .optional(),
  schedules: z.array(ScheduleSchema),
});

export const ReviewSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  calification: z.number().min(1).max(5),
  typeImprovement: z.enum([
    'Atención',
    'Comidas',
    'Bebidas',
    'Ambiente',
    'Otra',
  ]),
  comment: z.string(),
  email: z.string().email(),
  googleSent: z.boolean(),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  publishedAt: z.string().optional(),
  couponCode: z.string().optional(),
  couponUsed: z.boolean().optional(),
});

export type Restaurant = z.infer<typeof RestaurantSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type Review = z.infer<typeof ReviewSchema>;

export type ApiResponse<T> = {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};
