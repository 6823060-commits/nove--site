import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Новел — Монгол тууж унших платформ",
  description:
    "Новел дээр төрөл бүрийн тууж, роман унших, дуртай зохиолоо хадгалах, бүлэг тутамд сэтгэгдэл бичих боломжтой.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className="h-full antialiased" suppressHydrationWarning>
      
      <head>
        {/* Дэлгэц анивчихгүйн тулд хуудас ачаалахаас өмнө theme тохируулна */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-ink font-sans text-paper">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
