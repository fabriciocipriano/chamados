import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "@/components/layout/Providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <Providers session={session}>
      <div className="flex min-h-screen">
        <Sidebar userRole={session.user.role} userName={session.user.name} />
        <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8 overflow-auto">
          {children}
        </main>
      </div>
    </Providers>
  );
}
