import { prisma } from "../../utils/prisma";
import { usersListLimit } from "./utils";

export async function listRecentUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: usersListLimit,
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? "user",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}
