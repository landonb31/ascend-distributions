import { formatCurrency, formatDate } from "@/lib/utils";
import { apiError, getAuthContext } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("royalties")
      .select("*")
      .eq("user_id", user.id)
      .order("period_start", { ascending: false });

    if (startDate) {
      query = query.gte("period_start", startDate);
    }
    if (endDate) {
      query = query.lte("period_end", endDate);
    }

    const { data: royalties, error } = await query;

    if (error) {
      console.error("Royalties export error:", error);
      return apiError("Failed to export royalties", 500);
    }

    const trackIds = [...new Set((royalties || []).map((r) => r.track_id).filter(Boolean))] as string[];
    const releaseIds = [...new Set((royalties || []).map((r) => r.release_id).filter(Boolean))] as string[];

    const [{ data: tracks }, { data: releases }] = await Promise.all([
      trackIds.length > 0
        ? supabase.from("tracks").select("id, title").in("id", trackIds)
        : Promise.resolve({ data: [] }),
      releaseIds.length > 0
        ? supabase.from("releases").select("id, title").in("id", releaseIds)
        : Promise.resolve({ data: [] }),
    ]);

    const trackMap = new Map(tracks?.map((t) => [t.id, t.title]) || []);
    const releaseMap = new Map(releases?.map((r) => [r.id, r.title]) || []);

    const headers = [
      "Period Start",
      "Period End",
      "Platform",
      "Release",
      "Track",
      "Streams",
      "Amount",
      "Royalty Split",
      "Artist Share",
      "Status",
    ];

    const rows = (royalties || []).map((r) => [
      formatDate(r.period_start),
      formatDate(r.period_end),
      r.platform,
      r.release_id ? releaseMap.get(r.release_id) || "" : "",
      r.track_id ? trackMap.get(r.track_id) || "" : "",
      String(r.streams),
      formatCurrency(Number(r.amount)),
      `${r.royalty_split}%`,
      formatCurrency(Number(r.artist_share)),
      r.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const filename = `royalties-${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Royalties export error:", error);
    return apiError("Failed to export royalties", 500);
  }
}
