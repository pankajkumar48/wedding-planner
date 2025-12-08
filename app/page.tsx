import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Calendar, Globe, IndianRupee, Bell } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <span className="text-2xl font-bold">Swift Shaadi</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Plan Your Dream Indian Wedding
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Manage guests, vendors, RSVPs, and create beautiful wedding websites - all in one place
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">Start Planning Free</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Guest Management</CardTitle>
              <CardDescription>
                Easily manage your guest list, send invitations via WhatsApp/SMS, and track RSVPs in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Wedding Website</CardTitle>
              <CardDescription>
                Create a beautiful wedding website with your own subdomain, share your story, photos, and schedule
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>
                Browse vendors, track bookings, manage payments, and never miss a deadline
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <IndianRupee className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Payment Tracking</CardTitle>
              <CardDescription>
                Keep track of all vendor payments, advances, and balances in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Invite family members with different roles and permissions to help manage your wedding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Notifications</CardTitle>
              <CardDescription>
                Get notified about RSVPs, payment reminders, and important updates
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Ready to start planning?</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Join thousands of couples planning their perfect Indian wedding
            </CardDescription>
            <div className="pt-6">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Create Your Wedding Free
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t mt-20">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Swift Shaadi. Made with ❤️ for Indian weddings</p>
        </div>
      </footer>
    </div>
  );
}
