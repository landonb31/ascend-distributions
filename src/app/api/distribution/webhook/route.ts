import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/api";

const DSP_PLATFORM_MAP: Record<string, string> = {
  spotify: "Spotify",
  apple: "Apple Music",
  "apple music": "Apple Music",
  youtube: "YouTube Music",
  amazon: "Amazon Music",
  tidal: "Tidal",
  deezer: "Deezer",
};

function verifyBasicAuth(request: Request) {
  const expectedUser = process.env.FUGA_WEBHOOK_USERNAME;
  const expectedPass = process.env.FUGA_WEBHOOK_PASSWORD;
  if (!expectedUser || !expectedPass) return true;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const [user, pass] = decoded.split(":");
  return user === expectedUser && pass === expectedPass;
}

export async function POST(request: Request) {
  if (!verifyBasicAuth(request)) {
    return apiError("Unauthorized", 401);
  }

  try {
    const payload = await request.json();
    const admin = createAdminClient();

    const productId = String(
      payload?.product_id ||
        payload?.product?.id ||
        payload?.triggers?.[0]?.product_id ||
        ""
    );
    const dspName = String(payload?.dsp || payload?.dsp_name || "").toLowerCase();
    const deliveryStatus = String(payload?.status || payload?.delivery_status || "").toLowerCase();
    const upc = payload?.upc ? String(payload.upc) : null;

    if (!productId && !upc) {
      return apiSuccess({ received: true, ignored: true });
    }

    let releaseQuery = admin.from("releases").select("id, user_id, title, status");
    if (productId) {
      releaseQuery = releaseQuery.eq("external_product_id", productId);
    } else if (upc) {
      releaseQuery = releaseQuery.eq("upc", upc);
    }

    const { data: release } = await releaseQuery.maybeSingle();
    if (!release) {
      return apiSuccess({ received: true, matched: false });
    }

    const platform = DSP_PLATFORM_MAP[dspName] || payload?.dsp_name || dspName || "Unknown";

    if (deliveryStatus.includes("live") || deliveryStatus.includes("delivered")) {
      const { data: existing } = await admin
        .from("platform_deliveries")
        .select("id")
        .eq("release_id", release.id)
        .eq("platform", platform)
        .maybeSingle();

      if (existing?.id) {
        await admin
          .from("platform_deliveries")
          .update({
            status: "live",
            delivered_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await admin.from("platform_deliveries").insert({
          release_id: release.id,
          platform,
          status: "live",
          delivered_at: new Date().toISOString(),
        });
      }

      const { count } = await admin
        .from("platform_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("release_id", release.id)
        .eq("status", "live");

      if ((count || 0) >= 1 && release.status !== "live") {
        await admin
          .from("releases")
          .update({
            status: "live",
            distributed_at: new Date().toISOString(),
          })
          .eq("id", release.id);
      }
    }

    if (deliveryStatus.includes("fail") || deliveryStatus.includes("reject")) {
      await admin.from("platform_deliveries").insert({
        release_id: release.id,
        platform,
        status: deliveryStatus.includes("reject") ? "rejected" : "failed",
        error_message: payload?.message || payload?.error || null,
      });
    }

    return apiSuccess({ received: true, releaseId: release.id });
  } catch (error) {
    console.error("Distribution webhook error:", error);
    return apiError("Webhook handler failed", 500);
  }
}
