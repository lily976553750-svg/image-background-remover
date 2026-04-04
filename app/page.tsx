"use client";

import { useState, useCallback } from "react";
import Uploader from "@/components/Uploader";
import ImageCompare from "@/components/ImageCompare";
import Footer from "@/components/Footer";
import { Zap, Shield, Clock, Sparkles } from "lucide-react";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    // 保存原图预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("image_file", file);

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // 安全地解析错误响应
        let errorMsg = "Failed to process image";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `Server error (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      // 将返回的图片转为 base64
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      setProcessedImage(base64);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setFileName("");
    setError(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">BG Remover</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              How it works
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        {!processedImage && !isLoading && (
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Remove Image Background
              <span className="text-blue-500"> For Free</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI-powered background removal in seconds. No signup required.
              Download your transparent PNG instantly.
            </p>
          </div>
        )}

        {/* Upload / Result Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          {processedImage && originalImage ? (
            <ImageCompare
              originalImage={originalImage}
              processedImage={processedImage}
              fileName={fileName}
              onReset={handleReset}
            />
          ) : (
            <Uploader onUpload={handleUpload} isLoading={isLoading} />
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Tips Section */}
        {!processedImage && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">📷 Tips for Best Results:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>Clear subject:</strong> Photos with a clear foreground (person, animal, or object) work best</li>
              <li>• <strong>Good contrast:</strong> Subject should stand out from background</li>
              <li>• <strong>Good lighting:</strong> Well-lit photos produce better results</li>
              <li>• <strong>Supported formats:</strong> JPG, PNG, WebP (max 10MB)</li>
            </ul>
          </div>
        )}

        {/* Features Section */}
        {!processedImage && !isLoading && (
          <>
            <div id="how-it-works" className="mb-16">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Why Choose BG Remover?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-2xl bg-gray-50">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-600">
                    Process your images in seconds with our AI-powered technology.
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-gray-50">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Privacy First
                  </h3>
                  <p className="text-gray-600">
                    Your images are not stored. Process and download securely.
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-gray-50">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Signup
                  </h3>
                  <p className="text-gray-600">
                    Start immediately. No account or registration required.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                How It Works
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <span className="text-gray-700">Upload Image</span>
                </div>
                <div className="text-gray-300 text-2xl hidden md:block">→</div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <span className="text-gray-700">AI Processing</span>
                </div>
                <div className="text-gray-300 text-2xl hidden md:block">→</div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-gray-700">Download Result</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FAQ Section */}
        {!processedImage && !isLoading && (
          <div id="faq" className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium">
                  Is this service really free?
                  <span className="transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  Yes! You can remove backgrounds from images for free. We offer generous free usage with no signup required.
                </p>
              </details>

              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium">
                  What image formats are supported?
                  <span className="transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  We support JPG, PNG, and WebP formats. The maximum file size is 10MB.
                </p>
              </details>

              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium">
                  Are my images stored on your servers?
                  <span className="transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  No. Your images are processed in real-time and not stored on our servers. Your privacy is our priority.
                </p>
              </details>

              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium">
                  What is the output format?
                  <span className="transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  The processed image is returned as a transparent PNG, ready to use in any design or application.
                </p>
              </details>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
