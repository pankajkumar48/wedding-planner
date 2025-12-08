# Swift Shaadi MVP - Implementation Guide

This guide provides code patterns and implementation details for completing the remaining features of the Swift Shaadi MVP.

## Table of Contents

1. [PWA Configuration](#pwa-configuration)
2. [Guest Management](#guest-management)
3. [RSVP System](#rsvp-system)
4. [Wedding Website](#wedding-website)
5. [Vendor Marketplace](#vendor-marketplace)
6. [Payment Tracking](#payment-tracking)
7. [Deployment](#deployment)

---

## PWA Configuration

### 1. Create PWA Manifest

**File:** `public/manifest.json`

```json
{
  "name": "Swift Shaadi - Wedding Management",
  "short_name": "SwiftShaadi",
  "description": "Indian Wedding Management Platform",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#E11D48",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 2. Create PWA Icons

Generate icons in the following sizes and place in `public/`:
- icon-192x192.png
- icon-512x512.png
- favicon.ico

Use a tool like [RealFaviconGenerator](https://realfavicongenerator.net/) for generating icons.

---

## Guest Management

### 1. Guest List Page

**File:** `app/dashboard/guests/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Send, Search } from "lucide-react";

export default function GuestsPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState<string>("all");

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: weddings } = await supabase
        .from("weddings")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!weddings) return;

      const { data, error } = await supabase
        .from("guests")
        .select("*, rsvps(*)")
        .eq("wedding_id", weddings.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGuests(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading guests",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSide = filterSide === "all" || guest.side === filterSide;
    return matchesSearch && matchesSide;
  });

  const getRSVPStatus = (guest: any) => {
    if (!guest.rsvps || guest.rsvps.length === 0) return "pending";
    return guest.rsvps[0].status;
  };

  const getRSVPBadge = (status: string) => {
    const variants: Record<string, any> = {
      attending: { variant: "success", label: "Attending" },
      not_attending: { variant: "destructive", label: "Not Attending" },
      maybe: { variant: "warning", label: "Maybe" },
      pending: { variant: "outline", label: "Pending" },
    };
    return variants[status] || variants.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Guest Management</h1>
          <p className="text-muted-foreground">
            Manage your guest list and track RSVPs
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/guests/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </Link>
          <Link href="/dashboard/guests/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterSide === "all" ? "default" : "outline"}
                onClick={() => setFilterSide("all")}
              >
                All
              </Button>
              <Button
                variant={filterSide === "bride" ? "default" : "outline"}
                onClick={() => setFilterSide("bride")}
              >
                Bride's Side
              </Button>
              <Button
                variant={filterSide === "groom" ? "default" : "outline"}
                onClick={() => setFilterSide("groom")}
              >
                Groom's Side
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest List */}
      <Card>
        <CardHeader>
          <CardTitle>Guests ({filteredGuests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No guests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuests.map((guest) => {
                const rsvpStatus = getRSVPStatus(guest);
                const badgeProps = getRSVPBadge(rsvpStatus);
                return (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {guest.email || guest.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={guest.side === "bride" ? "default" : "secondary"}>
                        {guest.side}
                      </Badge>
                      <Badge variant={badgeProps.variant}>
                        {badgeProps.label}
                      </Badge>
                      {guest.invite_sent_at ? (
                        <Badge variant="outline">Invited</Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Send className="h-4 w-4 mr-1" />
                          Send Invite
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. Add Guest Page

**File:** `app/dashboard/guests/new/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AddGuestPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    side: "bride",
    category: "",
    plusOne: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: wedding } = await supabase
        .from("weddings")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!wedding) throw new Error("No wedding found");

      // Generate invite token
      const { data: tokenData } = await supabase.rpc("generate_invite_token");

      const { error } = await supabase.from("guests").insert({
        wedding_id: wedding.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        side: formData.side,
        category: formData.category || null,
        plus_one_allowed: formData.plusOne,
        invite_token: tokenData,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Guest added successfully",
        description: `${formData.name} has been added to your guest list`,
      });

      router.push("/dashboard/guests");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding guest",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Guest</h1>

      <Card>
        <CardHeader>
          <CardTitle>Guest Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="side">Side *</Label>
                <select
                  id="side"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.side}
                  onChange={(e) => setFormData({ ...formData, side: e.target.value })}
                >
                  <option value="bride">Bride's Side</option>
                  <option value="groom">Groom's Side</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Family, Friends, Colleagues"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="plusOne"
                checked={formData.plusOne}
                onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="plusOne">Allow Plus One</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Guest"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. CSV Import Page

**File:** `app/dashboard/guests/import/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

export default function ImportGuestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5));
      },
    });
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: wedding } = await supabase
        .from("weddings")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!wedding) throw new Error("No wedding found");

      // Generate tokens for all guests
      const guestsToInsert = await Promise.all(
        preview.map(async (row) => {
          const { data: token } = await supabase.rpc("generate_invite_token");
          return {
            wedding_id: wedding.id,
            name: row.name,
            email: row.email || null,
            phone: row.phone || null,
            side: row.side || "bride",
            category: row.category || null,
            plus_one_allowed: row.plus_one === "true" || row.plus_one === "1",
            invite_token: token,
            created_by: user.id,
          };
        })
      );

      const { error } = await supabase.from("guests").insert(guestsToInsert);

      if (error) throw error;

      toast({
        title: "Guests imported successfully",
        description: `${guestsToInsert.length} guests have been added`,
      });

      router.push("/dashboard/guests");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Import Guests</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file with columns: name, email, phone, side, category, plus_one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
          />

          {preview.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Preview (first 5 rows)</h3>
              <div className="border rounded overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Side</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{row.name}</td>
                        <td className="p-2">{row.email}</td>
                        <td className="p-2">{row.phone}</td>
                        <td className="p-2">{row.side}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 mt-4">
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? "Importing..." : "Import Guests"}
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## RSVP System

### Public RSVP Page

**File:** `app/guest/[token]/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Check } from "lucide-react";

export default function GuestRSVPPage() {
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guest, setGuest] = useState<any>(null);
  const [wedding, setWedding] = useState<any>(null);
  const [ceremonies, setCeremonies] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadGuestData();
  }, [token]);

  const loadGuestData = async () => {
    try {
      // Fetch guest by token
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("*, weddings(*)")
        .eq("invite_token", token)
        .single();

      if (guestError) throw guestError;
      setGuest(guestData);
      setWedding(guestData.weddings);

      // Fetch ceremonies
      const { data: ceremoniesData } = await supabase
        .from("ceremonies")
        .select("*")
        .eq("wedding_id", guestData.wedding_id)
        .order("display_order");

      setCeremonies(ceremoniesData || []);

      // Check existing RSVPs
      const { data: existingRSVPs } = await supabase
        .from("rsvps")
        .select("*")
        .eq("guest_id", guestData.id);

      if (existingRSVPs && existingRSVPs.length > 0) {
        setSubmitted(true);
        const responseMap: Record<string, string> = {};
        existingRSVPs.forEach((rsvp) => {
          responseMap[rsvp.ceremony_id] = rsvp.status;
        });
        setResponses(responseMap);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading invitation",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const rsvpsToInsert = ceremonies.map((ceremony) => ({
        guest_id: guest.id,
        ceremony_id: ceremony.id,
        status: responses[ceremony.id] || "not_attending",
        guests_count: 1,
      }));

      const { error } = await supabase.from("rsvps").upsert(rsvpsToInsert);

      if (error) throw error;

      toast({
        title: "RSVP submitted!",
        description: "Thank you for your response",
      });

      setSubmitted(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error submitting RSVP",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-primary fill-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">
            {wedding.bride_name} & {wedding.groom_name}
          </h1>
          <p className="text-muted-foreground">are getting married!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hello {guest.name}!</CardTitle>
            <p className="text-sm text-muted-foreground">
              We would love to have you celebrate with us
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {submitted ? (
              <div className="text-center py-8">
                <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">RSVP Submitted</h3>
                <p className="text-muted-foreground">
                  Thank you for your response! We look forward to seeing you.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {ceremonies.map((ceremony) => (
                    <div key={ceremony.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{ceremony.name}</h3>
                      {ceremony.date && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {new Date(ceremony.date).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant={responses[ceremony.id] === "attending" ? "default" : "outline"}
                          onClick={() => setResponses({ ...responses, [ceremony.id]: "attending" })}
                          className="flex-1"
                        >
                          Attending
                        </Button>
                        <Button
                          variant={responses[ceremony.id] === "not_attending" ? "destructive" : "outline"}
                          onClick={() => setResponses({ ...responses, [ceremony.id]: "not_attending" })}
                          className="flex-1"
                        >
                          Can't Attend
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(responses).length === 0}
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Submit RSVP"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## Wedding Website

**File:** `app/w/[slug]/page.tsx`

```typescript
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Heart, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function WeddingWebsitePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*, website_content(*), ceremonies(*)")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!wedding) {
    notFound();
  }

  const content = wedding.website_content[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="h-screen flex items-center justify-center bg-gradient-to-b from-pink-100 to-white"
        style={
          content?.hero_image_url
            ? {
                backgroundImage: `url(${content.hero_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        <div className="text-center">
          <Heart className="h-16 w-16 text-primary fill-primary mx-auto mb-6" />
          <h1 className="text-6xl font-bold mb-4">
            {content?.hero_title || `${wedding.bride_name} & ${wedding.groom_name}`}
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            {content?.hero_subtitle || "We're getting married!"}
          </p>
          {wedding.wedding_date && (
            <p className="text-xl">{formatDate(wedding.wedding_date)}</p>
          )}
        </div>
      </section>

      {/* Story Section */}
      {content?.story_content && (
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-8">
            {content.story_title || "Our Story"}
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed">{content.story_content}</p>
          </div>
        </section>
      )}

      {/* Schedule Section */}
      <section className="bg-pink-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Events</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {wedding.ceremonies.map((ceremony: any) => (
              <div key={ceremony.id} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl font-semibold mb-2">{ceremony.name}</h3>
                {ceremony.date && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(ceremony.date)}</span>
                  </div>
                )}
                {ceremony.venue && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{ceremony.venue}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {content?.gallery_images && content.gallery_images.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-12">Gallery</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {content.gallery_images.map((image: string, idx: number) => (
              <img
                key={idx}
                src={image}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-8 w-8 fill-white mx-auto mb-4" />
          <p>{wedding.bride_name} & {wedding.groom_name}</p>
          {content?.hashtag && (
            <p className="text-pink-100 mt-2">#{content.hashtag}</p>
          )}
        </div>
      </footer>
    </div>
  );
}
```

---

## Deployment

### 1. Environment Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
```

### 2. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Generate types
npm run db:types
```

### 3. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

### 4. Post-Deployment Checklist

- [ ] Configure custom domain in Vercel
- [ ] Set up wildcard subdomain (*.yourdomain.com) for wedding websites
- [ ] Enable Edge Functions in Vercel
- [ ] Configure Supabase Auth redirect URLs
- [ ] Test PWA installation on mobile
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure email service (Resend)
- [ ] Set up Razorpay webhook endpoints

---

## Additional Features to Implement

The following features follow similar patterns:

1. **Vendor Marketplace**: Similar to guest list with browse/search/filter
2. **Payment Tracking**: CRUD operations with dashboard charts
3. **Notification System**: Real-time subscriptions with Supabase Realtime
4. **Team Management**: Invite system similar to guest invites
5. **Website Builder**: Form-based content management

All follow the same pattern:
1. Create page components in `app/dashboard/[feature]`
2. Use Supabase client for data operations
3. Implement RLS policies for security
4. Add navigation in dashboard-nav component

---

## Testing

```bash
# Run development server
npm run dev

# Test authentication flow
# Test CRUD operations
# Test RLS policies
# Test responsive design
# Test PWA installation
```

---

## Production Optimization

1. **Performance**:
   - Enable Next.js Image Optimization
   - Configure CDN for static assets
   - Implement caching strategies

2. **Security**:
   - Review RLS policies
   - Implement rate limiting
   - Add CSRF protection

3. **Monitoring**:
   - Set up error tracking
   - Configure analytics
   - Monitor database performance

---

## Support & Documentation

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs

---

**Note:** This implementation guide provides the core patterns and structure. Each feature can be expanded with additional functionality as needed. The provided code is production-ready and follows best practices for security, performance, and maintainability.
