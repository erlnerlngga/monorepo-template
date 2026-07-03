import { z } from "zod";
import { usersListDefaultLimit, usersListMaxLimit } from "./utils";

export const usersQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(usersListMaxLimit).default(usersListDefaultLimit),
});
