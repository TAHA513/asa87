import { z } from "zod";

export const systemActivitySchema = z.object({
  id: z.number(),
  userId: z.number(),
  activityType: z.string(),
  entityType: z.string(),
  entityId: z.number().optional(),
  details: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export const insertSystemActivitySchema = systemActivitySchema.omit({ 
  id: true 
});

export type SystemActivity = z.infer<typeof systemActivitySchema>;
export type InsertSystemActivity = z.infer<typeof insertSystemActivitySchema>;

export const activityReportSchema = z.object({
  id: z.number(),
  userId: z.number(),
  reportType: z.string(),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  generatedAt: z.date(),
  data: z.record(z.unknown())
});

export const insertActivityReportSchema = activityReportSchema.omit({
  id: true,
  generatedAt: true
});

export type ActivityReport = z.infer<typeof activityReportSchema>;
export type InsertActivityReport = z.infer<typeof insertActivityReportSchema>;
