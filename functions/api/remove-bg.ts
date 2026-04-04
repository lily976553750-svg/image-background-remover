// Cloudflare Pages Function for remove.bg API
interface CloudflareContext {
  request: Request;
  env: {
    REMOVEBG_API_KEY: string;
  };
}

export async function onRequestPost(context: CloudflareContext) {
  try {
    const { request, env } = context;

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get("image_file");

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check API Key
    const apiKey = env.REMOVEBG_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert file to base64 (in memory)
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );

    // Call remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file_b64", base64Image);
    removeBgFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("remove.bg API error:", errorText);

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API quota exceeded. Please try again later." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      // 解析 remove.bg 的错误信息
      let userMessage = "Failed to process image. Please try a different image.";
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors[0]) {
          const code = errorData.errors[0].code;

          // 根据错误代码返回友好的提示
          if (code === 'unknown_foreground') {
            userMessage = "Could not identify a clear subject in the image. Please use a photo with a clear foreground (person, animal, or object).";
          } else if (code === 'invalid_image') {
            userMessage = "Invalid image format. Please use JPG, PNG, or WebP format.";
          } else if (code === 'file_size') {
            userMessage = "Image file is too large. Maximum size is 10MB.";
          }
        }
      } catch (e) {
        // 解析失败，使用默认消息
      }

      return new Response(
        JSON.stringify({ error: userMessage }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get processed image (in memory)
    const resultBuffer = await response.arrayBuffer();

    // Return image directly (no storage)
    return new Response(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=removed-bg.png",
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
