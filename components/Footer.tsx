export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 BG Remover. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Powered by AI. Your images are processed securely and not stored on our servers.
        </p>
      </div>
    </footer>
  );
}
