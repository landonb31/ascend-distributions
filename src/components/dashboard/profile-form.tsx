"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Instagram, Twitter, Youtube, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import type { Profile } from "@/types";

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
  { key: "twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://x.com/username" },
  { key: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
  { key: "spotify", label: "Spotify", icon: Music2, placeholder: "https://open.spotify.com/artist/..." },
] as const;

interface ProfileFormProps {
  profile: Profile | null;
  userId: string;
  email: string;
}

export function ProfileForm({ profile, userId, email }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    profile?.social_links || {}
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.display_name || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      location: profile?.location || "",
      isPublic: profile?.is_public ?? true,
    },
  });

  const isPublic = watch("isPublic");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data: ProfileInput) {
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    let avatarUrl = profile?.avatar_url || null;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setError("Failed to upload avatar.");
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = urlData.publicUrl;
    }

    const payload = {
      user_id: userId,
      display_name: data.displayName,
      bio: data.bio || null,
      website: data.website || null,
      location: data.location || null,
      is_public: data.isPublic,
      avatar_url: avatarUrl,
      social_links: socialLinks,
      updated_at: new Date().toISOString(),
    };

    if (profile) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", userId);

      if (updateError) {
        setError("Failed to update profile.");
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("profiles").insert(payload);
      if (insertError) {
        setError("Failed to create profile.");
        return;
      }
    }

    setSuccess(true);
    router.refresh();
  }

  const initials = (profile?.display_name || email).slice(0, 2).toUpperCase();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">Profile Photo</CardTitle>
          <CardDescription>Upload a photo for your public artist profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              {avatarPreview && <AvatarImage src={avatarPreview} alt="Avatar" />}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG or PNG, max 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-xs text-red-400">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell fans about yourself..."
              {...register("bio")}
            />
            {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://yoursite.com" {...register("website")} />
              {errors.website && <p className="text-xs text-red-400">{errors.website.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, Country" {...register("location")} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] p-4">
            <div>
              <Label htmlFor="isPublic">Public Profile</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Allow others to view your profile and releases
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(v) => setValue("isPublic", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">Social Links</CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Label>
              <Input
                id={key}
                placeholder={placeholder}
                value={socialLinks[key] || ""}
                onChange={(e) =>
                  setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-400/10 border border-green-400/20 p-3 text-sm text-green-400">
          Profile updated successfully.
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </form>
  );
}
