import { z } from "zod";

const imageUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Image URL must use http or https.",
  });

const optionalImageUrlSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}, imageUrlSchema.nullable().optional());

export const updateProfileSchema = z.object({
  image: optionalImageUrlSchema,
  name: z.string().trim().min(1).max(100),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
