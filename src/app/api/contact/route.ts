import { contactSchema } from "@/lib/validations";
import { sendContactEmail } from "@/lib/email";
import { apiError, apiSuccess } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const { name, email, subject, message } = parsed.data;

    await sendContactEmail(name, email, subject, message);

    return apiSuccess({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return apiError("Failed to send message", 500);
  }
}
