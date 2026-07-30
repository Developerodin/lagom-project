import { prisma } from "@/lib/prisma";

export function getStationaryLaunchSignups() {
  return prisma.stationaryLaunchSignup.findMany({
    orderBy: { createdAt: "desc" },
  });
}
