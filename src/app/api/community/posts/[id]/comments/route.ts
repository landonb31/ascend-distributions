import { commentSchema } from "@/lib/validations";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();

    const { data: post } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (!post) {
      return apiError("Post not found", 404);
    }

    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch comments error:", error);
      return apiError("Failed to fetch comments", 500);
    }

    const enriched = await attachProfiles(supabase, comments || []);

    return apiSuccess({ comments: enriched });
  } catch (error) {
    console.error("Comments GET error:", error);
    return apiError("Failed to fetch comments", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { content } = parsed.data;

    const { data: post } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single();

    if (!post) {
      return apiError("Post not found", 404);
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Create comment error:", error);
      return apiError("Failed to create comment", 500);
    }

    if (post.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        type: "new_comment",
        title: "New Comment",
        message: "Someone commented on your post",
        link: "/community",
        metadata: { post_id: postId, comment_id: comment.id },
      });
    }

    const [enriched] = await attachProfiles(supabase, [comment]);

    return apiSuccess({ comment: enriched }, 201);
  } catch (error) {
    console.error("Comments POST error:", error);
    return apiError("Failed to create comment", 500);
  }
}
