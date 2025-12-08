"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Home, Users, Calendar, Globe, CreditCard, Settings, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/database.types";

type Wedding = Database["public"]["Tables"]["weddings"]["Row"];

interface DashboardNavProps {
  user: any;
  weddings: Wedding[];
}

export default function DashboardNav({ user, weddings }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const currentWedding = weddings[0]; // For now, use first wedding

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/guests", label: "Guests", icon: Users },
    { href: "/dashboard/vendors", label: "Vendors", icon: Calendar },
    { href: "/dashboard/website", label: "Website", icon: Globe, premium: true },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              <span className="font-bold">Swift Shaadi</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.premium && currentWedding?.plan_type === "free" && (
                      <span className="ml-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded">PRO</span>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentWedding && (
              <div className="hidden md:block text-sm text-muted-foreground">
                {currentWedding.bride_name} & {currentWedding.groom_name}
              </div>
            )}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
