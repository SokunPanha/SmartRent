import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token, chatId, text } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Telegram Bot Token is required. Please set it in the settings panel." },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Tenant Telegram Chat ID is required. Please edit the Tenant profile." },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Message body is empty." },
        { status: 400 }
      );
    }

    // Clean up Chat ID if it contains '@' (usernames can be used if of type @channel, but IDs are numbers usually)
    const formattedChatId = chatId.trim();

    // Call real Telegram API
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: formattedChatId,
        text: text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API Error Response:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.description || `Telegram API responded with status ${response.status}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invoice successfully dispatched via Telegram Bot!",
      chatId: formattedChatId,
      messageId: data.result?.message_id,
    });

  } catch (error: any) {
    console.error("Internal Server Error in Telegram Send:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
