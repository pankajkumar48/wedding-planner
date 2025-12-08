import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, XCircle, Clock, Heart, Calendar, IndianRupee } from "lucide-react";
import { formatDate, formatCurrency, getDaysUntil } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's weddings
  const { data: weddings } = await supabase
    .from("weddings")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // If no wedding, redirect to setup
  if (!weddings || weddings.length === 0) {
    redirect("/dashboard/setup");
  }

  const wedding = weddings[0];

  // Fetch dashboard stats
  const { data: stats } = await supabase
    .from("wedding_dashboard_stats")
    .select("*")
    .eq("wedding_id", wedding.id)
    .single();

  const { data: recentGuests } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: upcomingPayments } = await supabase
    .from("payments")
    .select("*, vendor_bookings(vendor_id, vendors(name))")
    .eq("wedding_id", wedding.id)
    .eq("status", "pending")
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .limit(3);

  const daysUntil = getDaysUntil(wedding.wedding_date);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            {wedding.bride_name} & {wedding.groom_name}'s Wedding
          </p>
        </div>
        {wedding.plan_type === "free" && (
          <Link href="/dashboard/billing">
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        )}
      </div>

      {/* Countdown Card */}
      {wedding.wedding_date && (
        <Card className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              {daysUntil > 0 ? `${daysUntil} Days Until Your Wedding!` : "Your Wedding Day Is Here!"}
            </CardTitle>
            <CardDescription className="text-white/90">
              {formatDate(wedding.wedding_date)}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_guests || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attending</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.attending_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_count || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booked Vendors</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.booked_vendors || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.total_pending || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.total_paid || 0)} paid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Guests */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Guests</CardTitle>
              <Link href="/dashboard/guests">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentGuests && recentGuests.length > 0 ? (
              <div className="space-y-4">
                {recentGuests.map((guest) => (
                  <div key={guest.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">{guest.email || guest.phone}</p>
                    </div>
                    <Badge variant={guest.side === "bride" ? "default" : "secondary"}>
                      {guest.side}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No guests added yet</p>
                <Link href="/dashboard/guests">
                  <Button variant="outline" size="sm" className="mt-2">
                    Add Guests
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upcoming Payments</CardTitle>
              <Link href="/dashboard/payments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingPayments && upcomingPayments.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayments.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {payment.vendor_bookings?.vendors?.name || "Vendor"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(payment.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(payment.amount)}</p>
                      <Badge variant="warning" className="mt-1">
                        {payment.payment_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending payments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <Link href="/dashboard/guests/import" className="block">
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Import Guests
            </Button>
          </Link>
          <Link href="/dashboard/vendors" className="block">
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Find Vendors
            </Button>
          </Link>
          <Link href="/dashboard/website" className="block">
            <Button variant="outline" className="w-full">
              <Heart className="h-4 w-4 mr-2" />
              Edit Website
            </Button>
          </Link>
          <Link href="/dashboard/settings" className="block">
            <Button variant="outline" className="w-full">
              Manage Wedding
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
