import { z } from "zod";

export const themeSettingsSchema = z.object({
  variant: z.enum(["modern", "classic", "elegant", "vibrant", "natural"]),
  fontStyle: z.enum(["noto-kufi", "cairo", "amiri", "tajawal", "ibm-plex", "aref-ruqaa", "lateef", "reem-kufi"]),
  fontSize: z.enum(["small", "medium", "large", "xlarge"]),
  appearance: z.enum(["light", "dark", "system"]),
  radius: z.number(),
  primary: z.string().optional()
});

export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type InsertThemeSettings = z.infer<typeof themeSettingsSchema>;