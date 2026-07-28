import { AuthEnv, jsonResponse, readSession } from "../_shared/auth";
import {
  ensureUserFromSession,
  getMonthlySuccessfulRemovals,
  getPlanLimit,
  recordSuccessfulRemoval,
} from "../_shared/db";

// Cloudflare Pages Function for remove.bg API
interface CloudflareContext {
  request: Request;
  env: AuthEnv & {
    REMOVEBG_API_KEY: string;
  };
}

export async function onRequestPost(context: CloudflareContext) {
  try {
    const { request, env } = context;

    const sessionUser = await readSession(request, env);
    if (!sessionUser) {
      return jsonResponse(
        {
          error: "login_required",
          message: "Please sign in with Google to use your free monthly credits.",
        },
        { status: 401 }
      );
    }

    if (!env.DB) {
      return jsonResponse(
        {
          error: "usage_tracking_unavailable",
          message: "Usage tracking is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const account = await ensureUserFromSession(env, sessionUser);
    if (!account) {
      return jsonResponse(
        {
          error: "account_unavailable",
          message: "Could not load your account. Please sign out and sign in again.",
        },
        { status: 503 }
      );
    }

    const planLimit = getPlanLimit(account.plan);
    const usedThisMonth = await getMonthlySuccessfulRemovals(env, account.id);
    if (usedThisMonth >= planLimit) {
      return jsonResponse(
        {
          error: "usage_limit_exceeded",
          message: `You have used all ${planLimit} images in your ${account.plan} plan this month. Please upgrade to continue.`,
          plan: account.plan,
          limit: planLimit,
          used: usedThisMonth,
        },
        { status: 402 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get("image_file");

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!(imageFile instanceof File)) {
      return jsonResponse(
        {
          error: "invalid_image",
          message: "Invalid image upload. Please use JPG, PNG, or WebP.",
        },
        { status: 400 }
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(imageFile.type)) {
      return jsonResponse(
        {
          error: "invalid_image",
          message: "Invalid image format. Please use JPG, PNG, or WebP.",
        },
        { status: 400 }
      );
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return jsonResponse(
        {
          error: "file_too_large",
          message: "Image file is too large. Maximum size is 10MB.",
        },
        { status: 400 }
      );
    }

    // Check API Key
    const apiKey = env.REMOVEBG_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "API key not configured" }, { status: 500 });
    }

    // Call remove.bg API with file directly
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageFile);
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
          JSON.stringify({ 
            error: "quota_exceeded",
            message: "API quota exceeded. Please try again later."
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      // 解析 remove.bg 的错误信息
      let errorCode = "unknown_error";
      let errorMessage = "Failed to process image. Please try a different photo.";
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors[0]) {
          const code = errorData.errors[0].code;
          const title = errorData.errors[0].title || "";
          
          // 根据错误代码设置友好的提示
          if (code === 'unknown_foreground') {
            errorCode = "no_clear_subject";
            errorMessage = "Could not identify a clear subject in this image.";
          } else if (code === 'invalid_file_type' || code === 'invalid_image') {
            errorCode = "invalid_image";
            errorMessage = "Invalid image format. Please use JPG, PNG, or WebP.";
          } else if (code === 'file_size') {
            errorCode = "file_too_large";
            errorMessage = "Image file is too large. Maximum size is 10MB.";
          } else {
            // 其他错误，使用 remove.bg 返回的标题
            errorMessage = title || errorMessage;
          }
        }
      } catch {
        // 解析失败，使用默认错误消息
      }

      return jsonResponse(
        {
          error: errorCode,
          message: errorMessage
        },
        { status: response.status }
      );
    }

    // Get processed image (in memory)
    const resultBuffer = await response.arrayBuffer();

    await recordSuccessfulRemoval(env, account.id, {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      plan: account.plan,
      usedBeforeRequest: usedThisMonth,
      monthlyLimit: planLimit,
    });

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
