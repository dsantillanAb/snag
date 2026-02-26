import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AuthProvider from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Snag | Inteligencia en Web Scraping",
    description: "Plataforma de generación de endpoints API para scraping con IA",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={inter.className}>
                <AuthProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-1">
                                {children}
                            </main>
                            <Footer />
                        </div>
                        <Toaster richColors position="top-right" />
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
