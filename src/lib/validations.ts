import { z } from "zod";
import { GENRES } from "@/lib/utils";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    artistName: z.string().min(2, "Artist name must be at least 2 characters"),
    role: z.enum(["artist", "label"]).default("artist"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z
    .string()
    .length(6, "Enter all 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
  password: z.string().min(8, "Password is required"),
});

export const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  isPublic: z.boolean().default(true),
});

export const releaseMetadataSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    trackCount: z.coerce.number().min(1).max(35).default(1),
    artistName: z.string().min(1, "Artist name is required"),
    featuringArtists: z.array(z.string()).optional(),
    album: z.string().optional(),
    genre: z.enum(GENRES as unknown as [string, ...string[]], {
      errorMap: () => ({ message: "Please select a genre" }),
    }),
    secondaryGenre: z.string().optional(),
    releaseDate: z.string().optional(),
    releaseTiming: z.enum(["asap", "scheduled"]).default("asap"),
    language: z.string().min(1, "Select a language"),
    recordLabel: z.string().optional(),
    previouslyReleased: z.boolean().default(false),
    selectedPlatforms: z.array(z.string()).min(1, "Select at least one store"),
    isExplicit: z.boolean().default(false),
    upc: z.string().optional(),
    isrc: z.string().optional(),
    hasExistingIsrc: z.boolean().default(false),
    showFeaturedInTitle: z.boolean().default(false),
    versionType: z.enum(["normal", "radio_edit", "other"]).default("normal"),
    versionInfo: z.string().optional(),
    isCoverSong: z.boolean().default(false),
    songwriterNames: z.array(z.string()).optional(),
    isInstrumental: z.boolean().default(false),
    usesAi: z.boolean().default(false),
    previewStart: z.enum(["auto", "manual"]).default("auto"),
    previewStartSeconds: z.coerce.number().optional(),
    socialMonetization: z.boolean().default(false),
    artistOnSpotify: z.boolean().default(true),
    artistOnApple: z.boolean().default(true),
    artistOnYoutube: z.boolean().default(true),
    artistOnInstagram: z.boolean().default(true),
    artistOnFacebook: z.boolean().default(true),
    confirmAuthorized: z.boolean().optional(),
    confirmNoUnauthorizedArtists: z.boolean().optional(),
    confirmNoPromoServices: z.boolean().optional(),
    confirmTerms: z.boolean().optional(),
    confirmYoutube: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.releaseTiming === "scheduled" && !data.releaseDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick a release date for scheduled releases",
        path: ["releaseDate"],
      });
    }

    if (!data.isCoverSong && (!data.songwriterNames || data.songwriterNames.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one songwriter for original songs",
        path: ["songwriterNames"],
      });
    }

    if (data.versionType === "other" && !data.versionInfo?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Describe the version (e.g. Acoustic, Remix)",
        path: ["versionInfo"],
      });
    }
  });

export const releaseDistributionSchema = releaseMetadataSchema.superRefine((data, ctx) => {
  const legalFields = [
    "confirmAuthorized",
    "confirmNoUnauthorizedArtists",
    "confirmNoPromoServices",
    "confirmTerms",
  ] as const;

  for (const field of legalFields) {
    if (!data[field]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required before releasing to stores",
        path: [field],
      });
    }
  }

  if (data.selectedPlatforms.includes("youtube_music") && !data.confirmYoutube) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Confirm YouTube Music delivery",
      path: ["confirmYoutube"],
    });
  }
});

export const payoutSchema = z.object({
  amount: z.number().min(1, "Minimum payout is $1"),
  method: z.enum(["paypal", "bank_transfer"]),
  paypalEmail: z.string().email().optional(),
  bankDetails: z
    .object({
      accountName: z.string(),
      accountNumber: z.string(),
      routingNumber: z.string(),
      bankName: z.string(),
    })
    .optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000),
  releaseId: z.string().uuid().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(1000),
});

export const rejectReleaseSchema = z.object({
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export const releaseCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  album: z.string().optional(),
  genre: z.enum(GENRES as unknown as [string, ...string[]]).optional(),
  releaseDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  artworkUrl: z.string().url().optional(),
  upc: z.string().optional(),
  artistId: z.string().uuid().optional(),
  labelId: z.string().uuid().optional(),
  tracks: z
    .array(
      z.object({
        title: z.string().min(1),
        artistName: z.string().min(1),
        featuringArtists: z.array(z.string()).optional(),
        trackNumber: z.number().int().min(1).default(1),
        durationSeconds: z.number().int().optional(),
        audioUrl: z.string().url().optional(),
        audioFormat: z.enum(["wav", "mp3", "m4a", "flac", "aiff", "wma"]).optional(),
        isrc: z.string().optional(),
        isExplicit: z.boolean().default(false),
      })
    )
    .optional(),
});

export const releaseUpdateSchema = releaseCreateSchema.partial();

export const checkoutSchema = z.object({
  plan: z.enum(["standard", "pro"]),
  interval: z.enum(["monthly", "yearly"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ReleaseMetadataInput = z.infer<typeof releaseMetadataSchema>;
export type ReleaseDistributionInput = z.infer<typeof releaseDistributionSchema>;
export type PayoutInput = z.infer<typeof payoutSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type RejectReleaseInput = z.infer<typeof rejectReleaseSchema>;
export type ReleaseCreateInput = z.infer<typeof releaseCreateSchema>;
export type ReleaseUpdateInput = z.infer<typeof releaseUpdateSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
