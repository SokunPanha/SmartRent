/**
 * Server-side Telegram Bot API helpers. The bot token lives only in
 * `process.env.TELEGRAM_BOT_TOKEN` — never sent to or accepted from the
 * client. See .env.example for the required variables.
 */

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set. See .env.example.');
  return token;
}

export type TelegramSendResult =
  | { ok: true; messageId: number }
  | { ok: false; error: string };

/** Send a message to a chat via the bot. `chatId` must already be resolved server-side. */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  opts: { parseMode?: 'HTML' } = {}
): Promise<TelegramSendResult> {
  const res = await fetch(`https://api.telegram.org/bot${getBotToken()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: opts.parseMode ?? 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    console.error('[telegram] sendMessage error:', data);
    return { ok: false, error: data.description || `Telegram API responded with status ${res.status}` };
  }
  return { ok: true, messageId: data.result?.message_id };
}

/** Health check used by the admin "Test Bot Connection" action. */
export async function getBotIdentity(): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${getBotToken()}/getMe`);
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.description || `Telegram API responded with status ${res.status}` };
    }
    return { ok: true, username: data.result?.username };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Validate that an incoming webhook request really came from Telegram.
 * Telegram echoes the secret set during `setWebhook` in this header on every call.
 */
export function isValidWebhookSecret(headerValue: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) throw new Error('TELEGRAM_WEBHOOK_SECRET is not set. See .env.example.');
  return headerValue === secret;
}
