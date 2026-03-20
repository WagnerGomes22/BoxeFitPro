"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAdminClasses() {
  const session = await auth();
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    return [];
  }

  const classes = await prisma.class.findMany({
    orderBy: { startTime: 'desc' },
    include: {
      instructor: {
        select: { name: true, email: true }
      },
      _count: {
        select: { 
            bookings: {
                where: { status: { not: "CANCELED" } }
            } 
        }
      }
    }
  });

  const sortedClasses = [...classes].sort((a, b) => {
    if (b._count.bookings !== a._count.bookings) {
      return b._count.bookings - a._count.bookings;
    }
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  return sortedClasses;
}
