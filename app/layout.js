// app/layout.js

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense Verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5461636853860307"
          crossOrigin="anonymous"
        ></script>
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}