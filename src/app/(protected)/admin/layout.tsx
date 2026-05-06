import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/requireRole";

export default async function AdminLayout({children}: {children: ReactNode}) {
    try {
        await requireRole([Role.Setter, Role.Admin, Role.SuperAdmin])
    } catch {
        //als het faalt redirect home
        redirect('/')
    }

    return <>{children}</>
}