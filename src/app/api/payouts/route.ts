import { payoutSchema } from "@/lib/validations";
import { MIN_PAYOUT_AMOUNT } from "@/lib/utils";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch payouts error:", error);
      return apiError("Failed to fetch payouts", 500);
    }

    return apiSuccess({ payouts: data });
  } catch (error) {
    console.error("Payouts GET error:", error);
    return apiError("Failed to fetch payouts", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const parsed = payoutSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { amount, method, paypalEmail, bankDetails } = parsed.data;

    if (amount < MIN_PAYOUT_AMOUNT) {
      return apiError(`Minimum payout amount is $${MIN_PAYOUT_AMOUNT}`);
    }

    if (method === "paypal" && !paypalEmail) {
      return apiError("PayPal email is required for PayPal payouts");
    }

    if (method === "bank_transfer" && !bankDetails) {
      return apiError("Bank details are required for bank transfer payouts");
    }

    const { data: royalties } = await supabase
      .from("royalties")
      .select("artist_share")
      .eq("user_id", user.id)
      .eq("status", "pending");

    const availableBalance =
      royalties?.reduce((sum, r) => sum + Number(r.artist_share), 0) || 0;

    const { data: pendingPayouts } = await supabase
      .from("payouts")
      .select("amount")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"]);

    const pendingAmount =
      pendingPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    if (amount > availableBalance - pendingAmount) {
      return apiError("Insufficient balance for this payout");
    }

    const { data: payout, error } = await supabase
      .from("payouts")
      .insert({
        user_id: user.id,
        amount,
        method,
        status: "pending",
        paypal_email: method === "paypal" ? paypalEmail : null,
        bank_details: method === "bank_transfer" ? bankDetails : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create payout error:", error);
      return apiError("Failed to create payout request", 500);
    }

    return apiSuccess({ payout }, 201);
  } catch (error) {
    console.error("Payouts POST error:", error);
    return apiError("Failed to create payout request", 500);
  }
}
