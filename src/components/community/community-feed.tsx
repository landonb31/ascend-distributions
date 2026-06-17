"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Post, Comment, Profile } from "@/types";

type EnrichedPost = Post & {
  profile?: Pick<Profile, "display_name" | "avatar_url" | "user_id"> | null;
  user_liked?: boolean;
};

type EnrichedComment = Comment & {
  profile?: Pick<Profile, "display_name" | "avatar_url" | "user_id"> | null;
};

export function CommunityFeed() {
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, EnrichedComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/community/posts");
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setError("Failed to load community feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleCreatePost() {
    if (!newPost.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }
      const data = await res.json();
      setPosts((prev) => [data.post, ...prev]);
      setNewPost("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setPosting(false);
    }
  }

  async function handleToggleLike(postId: string) {
    setLikeLoading(postId);
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, user_liked: data.liked, like_count: data.likeCount }
            : p
        )
      );
    } catch {
      setError("Failed to update like");
    } finally {
      setLikeLoading(null);
    }
  }

  async function loadComments(postId: string) {
    if (comments[postId]) {
      setExpandedComments((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) next.delete(postId);
        else next.add(postId);
        return next;
      });
      return;
    }

    setCommentLoading(postId);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments((prev) => ({ ...prev, [postId]: data.comments || [] }));
      setExpandedComments((prev) => new Set(prev).add(postId));
    } catch {
      setError("Failed to load comments");
    } finally {
      setCommentLoading(null);
    }
  }

  async function handleAddComment(postId: string) {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    setCommentLoading(postId);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add comment");
      }
      const data = await res.json();
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setExpandedComments((prev) => new Set(prev).add(postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setCommentLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card glass>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Share something with the community..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleCreatePost} disabled={posting || !newPost.trim()}>
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {posts.length === 0 ? (
        <Card glass>
          <CardContent className="py-12 text-center text-muted-foreground">
            No posts yet. Be the first to share!
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card glass key={post.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.profile?.display_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {post.profile?.display_name || "Artist"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1 border-t border-white/5">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  disabled={likeLoading === post.id}
                  className={cn(
                    "flex items-center gap-1.5 text-sm transition-colors",
                    post.user_liked ? "text-red-400" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", post.user_liked && "fill-current")}
                  />
                  {post.like_count}
                </button>
                <button
                  onClick={() => loadComments(post.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comment_count}
                </button>
              </div>

              {expandedComments.has(post.id) && (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  {(comments[post.id] || []).map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={comment.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {comment.profile?.display_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="text-xs font-semibold">
                          {comment.profile?.display_name || "Artist"}
                        </span>
                        <p className="text-sm mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                      disabled={
                        commentLoading === post.id ||
                        !commentInputs[post.id]?.trim()
                      }
                    >
                      {commentLoading === post.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
