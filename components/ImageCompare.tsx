"use client";

import { useState } from "react";
import { Download, RefreshCw, CheckCircle } from "lucide-react";

interface ImageCompareProps {
  originalImage: string;
  processedImage: string;
  fileName: string;
  onReset: () => void;
}

export default function ImageCompare({
  originalImage,
  processedImage,
  fileName,
  onReset,
}: ImageCompareProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // 将 base64 转换为 blob
      const response = await fetch(processedImage);
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // 生成文件名
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      a.download = `${baseName}_nobg.png`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full">
      {/* 成功提示 */}
      <div className="flex items-center justify-center gap-2 mb-6 text-green-600">
        <CheckCircle size={20} />
        <span className="font-medium">Background removed successfully!</span>
      </div>

      {/* 图片对比 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 原图 */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Original</p>
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={originalImage}
              alt="Original"
              className="max-h-80 object-contain"
            />
          </div>
        </div>

        {/* 处理后 */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Background Removed
          </p>
          <div className="relative rounded-lg overflow-hidden bg-checkerboard">
            <img
              src={processedImage}
              alt="Processed"
              className="max-h-80 object-contain"
            />
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-full font-medium text-white
            transition-all duration-300 transform hover:scale-105
            ${downloaded 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-blue-500 hover:bg-blue-600"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Downloading...</span>
            </>
          ) : downloaded ? (
            <>
              <CheckCircle size={20} />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Download Transparent PNG</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={20} />
          <span>Process Another Image</span>
        </button>
      </div>
    </div>
  );
}
