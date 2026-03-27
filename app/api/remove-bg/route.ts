// Next.js API Route for local development
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 支持 multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image_file") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Get API Key from environment
    const apiKey = process.env.REMOVEBG_API_KEY;
    if (!apiKey) {
      console.error("REMOVEBG_API_KEY not configured");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Call remove.bg API using JSON format (more reliable in Node.js)
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_file_b64: base64Image,
        size: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("remove.bg API error:", response.status, errorText);

      if (response.status === 402) {
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: "Invalid API key. Please check configuration." },
          { status: 500 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          { error: "Invalid image format. Please try a different image." },
          { status: 400 }
        );
      }

      // 解析 remove.bg 的错误信息
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = errorJson.errors?.[0]?.title || "Failed to process image";
        return NextResponse.json(
          { error: errorMsg },
          { status: response.status }
        );
      } catch {
        // 返回通用错误，避免前端 JSON 解析失败
        return NextResponse.json(
          { error: `API error (${response.status}): Failed to process image` },
          { status: response.status }
        );
      }
    }

    // Get processed image
    const resultBuffer = await response.arrayBuffer();

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=removed-bg.png",
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
