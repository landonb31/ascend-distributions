import { postSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

async function attachProfiles<T extends { user_id: string }>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: T[]
) {
  if (items.length === 0) return items;

  const userIds = [...new Set(items.map((i) => i.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

  return items.map((item) => ({
    ...item,
    profile: profileMap.get(item.user_id) || null,
  }));
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch posts error:", error);
      return apiError("Failed to fetch posts", 500);
    }

    let likedPostIds = new Set<string>();
    if (user && posts && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const { data: likes } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);

      likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
    }

    const withProfiles = await attachProfiles(supabase, posts || []);
    const enrichedPosts = withProfiles.map((post) => ({
      ...post,
      user_liked: likedPostIds.has(post.id),
    }));

    return apiSuccess({ posts: enrichedPosts });
  } catch (error) {
    console.error("Posts GET error:", error);
    return apiError("Failed to fetch posts", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { content, releaseId } = parsed.data;

    if (releaseId) {
      const { data: release } = await supabase
        .from("releases")
        .select("id")
        .eq("id", releaseId)
        .eq("user_id", user.id)
        .single();

      if (!release) {
        return apiError("Release not found", 404);
      }
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content,
        release_id: releaseId || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Create post error:", error);
      return apiError("Failed to create post", 500);
    }

    const [enriched] = await attachProfiles(supabase, [post]);

    return apiSuccess({ post: enriched }, 201);
  } catch (error) {
    console.error("Posts POST error:", error);
    return apiError("Failed to create post", 500);
  }
}
