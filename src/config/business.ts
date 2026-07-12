// Single source of truth for business/contact constants.
// Identifiers and comments are in English; user-facing copy stays in Spanish.

/** Production domain (no trailing slash). */
export const SITE_URL = "https://fumigadoraecoquimia.com.do";

/** Official phone number in E.164 format (with leading +). */
export const PHONE_E164 = "+18097777586";

/** Official phone number formatted for display. */
export const PHONE_DISPLAY = "809-777-7586";

/** wa.me base URL (digits only, no leading +). */
export const WHATSAPP_BASE_URL = "https://wa.me/18097777586";

/** Commercial email (lowercase). */
export const EMAIL_COMMERCIAL = "areacomercial.eco@gmail.com";

/** Business opening hours (user-facing, Spanish). */
export const BUSINESS_HOURS = "Lun–Vie 8:30–17:00 | Sáb 9:00–13:00";

/**
 * Build a WhatsApp click-to-chat URL with a pre-filled Spanish message.
 * @param message Text shown pre-filled in the WhatsApp chat (Spanish).
 */
export function buildWhatsAppUrl(message: string): string {
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
