import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data: post } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single();

    if (!post) {
      return apiError("Post not found", 404);
    }

    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (existingLike) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        console.error("Unlike error:", error);
        return apiError("Failed to unlike post", 500);
      }

      const { data: updatedPost } = await supabase
        .from("posts")
        .select("like_count")
        .eq("id", postId)
        .single();

      return apiSuccess({
        liked: false,
        likeCount: updatedPost?.like_count ?? 0,
      });
    }

    const { error } = await supabase.from("likes").insert({
      user_id: user.id,
      post_id: postId,
    });

    if (error) {
      console.error("Like error:", error);
      return apiError("Failed to like post", 500);
    }

    if (post.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        type: "new_like",
        title: "New Like",
        message: "Someone liked your post",
        link: "/community",
        metadata: { post_id: postId },
      });
    }

    const { data: updatedPost } = await supabase
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();

    return apiSuccess({
      liked: true,
      likeCount: updatedPost?.like_count ?? 0,
    });
  } catch (error) {
    console.error("Like toggle error:", error);
    return apiError("Failed to toggle like", 500);
  }
}
