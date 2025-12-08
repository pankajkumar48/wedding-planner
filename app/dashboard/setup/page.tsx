"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Heart, Calendar, MapPin } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    city: "",
    venue: "",
  });

  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Generate slug
      const { data: slugData, error: slugError } = await supabase.rpc(
        "generate_wedding_slug",
        {
          p_bride_name: formData.brideName,
          p_groom_name: formData.groomName,
        }
      );

      if (slugError) {
        console.error("Slug generation error:", slugError);
      }

      // Create wedding
      const { data: wedding, error: weddingError } = await supabase
        .from("weddings")
        .insert({
          owner_id: user.id,
          bride_name: formData.brideName,
          groom_name: formData.groomName,
          wedding_date: formData.weddingDate || null,
          city: formData.city || null,
          venue: formData.venue || null,
          slug: slugData || `${formData.brideName.toLowerCase()}-${formData.groomName.toLowerCase()}`,
          status: "active",
          plan_type: "free",
        })
        .select()
        .single();

      if (weddingError) throw weddingError;

      // Create default website content
      const { error: contentError } = await supabase
        .from("website_content")
        .insert({
          wedding_id: wedding.id,
          hero_title: `${formData.brideName} & ${formData.groomName}`,
          hero_subtitle: "We're getting married!",
          story_title: "Our Story",
        });

      if (contentError) {
        console.error("Website content creation error:", contentError);
      }

      // Create default ceremonies
      const ceremonies = [
        { name: "Mehndi", type: "pre_wedding", display_order: 1 },
        { name: "Sangeet", type: "pre_wedding", display_order: 2 },
        { name: "Wedding", type: "main", display_order: 3 },
        { name: "Reception", type: "post_wedding", display_order: 4 },
      ];

      const { error: ceremoniesError } = await supabase
        .from("ceremonies")
        .insert(
          ceremonies.map((ceremony) => ({
            wedding_id: wedding.id,
            ...ceremony,
          }))
        );

      if (ceremoniesError) {
        console.error("Ceremonies creation error:", ceremoniesError);
      }

      toast({
        title: "Wedding created!",
        description: "Your wedding has been set up successfully.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create wedding",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-primary fill-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Let's Set Up Your Wedding</h1>
          <p className="text-muted-foreground">
            Tell us about your special day
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wedding Details</CardTitle>
            <CardDescription>
              Enter the basic information about your wedding. You can always update this later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWedding} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brideName">Bride's Name *</Label>
                  <Input
                    id="brideName"
                    placeholder="Bride's name"
                    value={formData.brideName}
                    onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groomName">Groom's Name *</Label>
                  <Input
                    id="groomName"
                    placeholder="Groom's name"
                    value={formData.groomName}
                    onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="weddingDate"
                    type="date"
                    className="pl-10"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      placeholder="City"
                      className="pl-10"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="Venue name"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Creating..." : "Create Wedding"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
