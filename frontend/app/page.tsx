"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import StatsSection from "@/components/stats-section";
import { useEffect, useState } from "react";
import {
    ZapIcon,
    GlobeIcon,
    AiBeautifyIcon,
    ApiIcon,
    PlusSignCircleIcon,
    CheckmarkCircle01Icon,
    ArrowRight01Icon,
    SourceCodeIcon,
    DatabaseIcon,
    ShieldKeyIcon,
    SparklesIcon,
    StarIcon,
    CrownIcon,
    TimeScheduleIcon,
} from "@hugeicons/core-free-icons";

const features = [
    {
        icon: GlobeIcon,
        title: "Cualquier Sitio Web",
        desc: "Extrae datos de SPAs, páginas con JavaScript dinámico, y estructuras complejas con Playwright.",
    },
    {
        icon: AiBeautifyIcon,
        title: "Análisis con IA",
        desc: "Nuestra IA detecta automáticamente los elementos relevantes y genera los selectores CSS precisos.",
    },
    {
        icon: ApiIcon,
        title: "API Instantánea",
        desc: "Obtén un endpoint REST listo para producción segundos después de analizar el sitio.",
    },
    {
        icon: DatabaseIcon,
        title: "Base de Datos Cloud",
        desc: "Todos tus scrapers y endpoints se almacenan de forma segura en PostgreSQL en la nube.",
    },
    {
        icon: SourceCodeIcon,
        title: "Datos Estructurados",
        desc: "Recibe los datos limpios en formato JSON, listos para integrar en tu aplicación.",
    },
    {
        icon: TimeScheduleIcon,
        title: "Historial y Stats",
        desc: "Monitorea el uso de tus endpoints, visitantes y métricas en tiempo real.",
    },
];

const steps = [
    { step: "01", title: "Ingresa una URL", desc: "Pega la URL del sitio web que quieres scraping." },
    { step: "02", title: "IA Analiza", desc: "Nuestra IA escanea la página y sugiere los campos más relevantes." },
    { step: "03", title: "Confirma y Publica", desc: "Revisa los selectores y publica tu endpoint con un click." },
    { step: "04", title: "Consume la API", desc: "Llama a tu endpoint desde cualquier app y recibe JSON en tiempo real." },
];

const plans = [
    {
        name: "Free",
        badge: null,
        price: "$0",
        period: "para siempre",
        desc: "Perfecto para explorar y experimentar con Snag.",
        icon: StarIcon,
        color: "from-slate-500/20 to-slate-600/10",
        border: "border-border",
        buttonVariant: "outline" as const,
        buttonText: "Empieza Gratis",
        features: [
            "3 scrapers activos",
            "1,000 requests / mes",
            "Análisis IA básico",
            "Endpoints públicos",
            "Soporte por comunidad",
            "Historial 7 días",
        ],
        missing: [
            "Endpoints privados",
            "Rate limit personalizado",
            "Soporte prioritario",
        ],
        disabled: false,
    },
    {
        name: "Hobbie",
        badge: "Próximamente",
        price: "$9",
        period: "por mes",
        desc: "Para desarrolladores que necesitan más potencia.",
        icon: ZapIcon,
        color: "from-violet-500/20 to-primary/10",
        border: "border-primary/50",
        buttonVariant: "default" as const,
        buttonText: "Empezar Ahora",
        features: [
            "20 scrapers activos",
            "50,000 requests / mes",
            "Análisis IA avanzado",
            "Endpoints públicos y privados",
            "Rate limit personalizable",
            "Historial 30 días",
            "Soporte por email",
            "API key dedicada",
        ],
        missing: [],
        disabled: true,
    },
];

const jsonResponse = `{
  "endpoint": "bancentral-cmch",
  "url": "https://www.bancentral.gov.do/SectorExterno/HistoricoTasas",
  "data": {
    "Date": "25 febrero de 2026",
    "Current Purchase Rate": "59.9853",
    "Current Selling Rate": "60.6537",
    "items": []
  },
  "params": {
    "limit": 10,
    "fetch_full_content": false,
    "wait_time": 2000
  },
  "usage": {
    "request_count": 5,
    "remaining_requests": 995,
    "credits_remaining": 29.49,
    "cost": 0.03
  },
  "timestamp": "2026-02-26T02:05:27.416285"
}`;

export default function Home() {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < jsonResponse.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + jsonResponse[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 15); // Velocidad de escritura
            return () => clearTimeout(timeout);
        }
    }, [currentIndex]);

    return (
        <div className="overflow-x-hidden">
            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="relative w-full py-16 md:py-24 lg:py-32">{/* Reducido de py-20/32/40 */}
                {/* Background glow */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
                    <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px]" />
                </div>

                <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center gap-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary font-medium">
                        <HugeiconsIcon icon={SparklesIcon} size={14} />
                        Powered by IA · Zero config
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none max-w-4xl">
                        Convierte{" "}
                        <span className="bg-gradient-to-r from-violet-400 via-primary to-cyan-400 bg-clip-text text-transparent">
                            cualquier sitio web
                        </span>{" "}
                        en una API
                    </h1>

                    <p className="max-w-[640px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                        Snag analiza páginas web con IA y genera endpoints REST personalizados en segundos.
                        Sin código, sin configuración manual.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <Button asChild size="lg" className="gap-2 text-base px-6 h-12">
                            <Link href="/login">
                                <HugeiconsIcon icon={PlusSignCircleIcon} size={18} />
                                Crear mi primer scraper
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="gap-2 text-base px-6 h-12">
                            <Link href="#precios">
                                Ver Precios
                                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                            </Link>
                        </Button>
                    </div>

                    {/* Social proof */}
                    <p className="text-xs text-muted-foreground mt-2">
                        ✓ Gratis para empezar &nbsp;·&nbsp; ✓ Sin tarjeta de crédito &nbsp;·&nbsp; ✓ Listo en 60 segundos
                    </p>

                    {/* Hero visual mockup - Más ancho y menos alto con animación */}
                    <div className="mt-8 w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60 overflow-hidden">
                        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10 bg-[#111111]">
                            <span className="h-3 w-3 rounded-full bg-red-500/80" />
                            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                            <span className="h-3 w-3 rounded-full bg-green-500/80" />
                            <span className="ml-3 text-xs text-zinc-500 font-mono">GET https://snag.dploy.lol/api/v1/endpoints/scrape/bancentral-cmch</span>
                        </div>
                        <div className="p-4 font-mono text-xs md:text-sm text-left overflow-auto bg-[#0a0a0a] h-[280px] md:h-[300px]">
                            <pre className="text-emerald-400 leading-relaxed">
                                {displayedText}
                                <span className="animate-pulse">▊</span>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────── */}
            <section id="caracteristicas" className="w-full py-16 md:py-20 bg-muted/30 border-y border-border/50">{/* Reducido de py-20/28 */}
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Todo lo que necesitas</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Una plataforma completa para extraer, estructurar y exponer datos de la web.
                        </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                            >
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <HugeiconsIcon icon={f.icon} size={20} className="text-primary" />
                                </div>
                                <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* ── STATS ────────────────────────────────────────── */}
            <div id="estadisticas"><StatsSection /></div>

            {/* ── HOW IT WORKS ─────────────────────────────────── */}
            <section className="w-full py-16 md:py-20">{/* Reducido de py-20/28 */}
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">¿Cómo funciona?</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            De URL a API en 4 pasos simples.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s, i) => (
                            <div key={s.step} className="relative flex flex-col gap-3">
                                {/* Connector line */}
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-6 left-[calc(100%-12px)] w-full h-px bg-gradient-to-r from-primary/40 to-transparent z-0" />
                                )}
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center z-10">
                                    <span className="text-primary font-bold text-sm">{s.step}</span>
                                </div>
                                <h3 className="font-semibold">{s.title}</h3>
                                <p className="text-sm text-muted-foreground">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ──────────────────────────────────────── */}
            <section id="precios" className="w-full py-16 md:py-20 bg-muted/30 border-y border-border/50">{/* Reducido de py-20/28 */}
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Precios simples y transparentes</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Sin sorpresas. Empieza gratis y escala cuando lo necesites.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative flex flex-col rounded-2xl border ${plan.border} bg-gradient-to-b ${plan.color} backdrop-blur-sm overflow-hidden ${(plan as any).disabled ? "opacity-60 grayscale" : ""
                                    }`}
                            >
                                {/* Disabled overlay */}
                                {(plan as any).disabled && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/50 backdrop-blur-[2px] rounded-2xl">
                                        <span className="text-2xl">🚧</span>
                                        <p className="font-bold text-sm">No disponible por el momento</p>
                                        <p className="text-xs text-muted-foreground">Próximamente...</p>
                                    </div>
                                )}
                                {/* Popular badge */}
                                {plan.badge && (
                                    <div className="absolute top-4 right-4">
                                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                                            <HugeiconsIcon icon={CrownIcon} size={11} />
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                <div className="p-7 flex flex-col gap-5 flex-1">
                                    {/* Header */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <HugeiconsIcon icon={plan.icon} size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg leading-none">{plan.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                                        <span className="text-muted-foreground text-sm mb-1.5">{plan.period}</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="flex flex-col gap-2.5 flex-1">
                                        {plan.features.map((feat) => (
                                            <li key={feat} className="flex items-center gap-2.5 text-sm">
                                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-500 shrink-0" />
                                                {feat}
                                            </li>
                                        ))}
                                        {plan.missing.map((feat) => (
                                            <li key={feat} className="flex items-center gap-2.5 text-sm text-muted-foreground/50 line-through">
                                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-muted-foreground/30 shrink-0" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Button asChild variant={plan.buttonVariant} size="lg" className="w-full mt-2 gap-2">
                                        <Link href="/login">
                                            {plan.buttonText}
                                            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        * Precios en USD. El plan Hobbie está en acceso anticipado — precio sujeto a cambios.
                    </p>
                </div>
            </section>

            {/* ── CTA FINAL ────────────────────────────────────── */}
            <section className="w-full py-16 md:py-20">{/* Reducido de py-20/28 */}
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <div className="relative mx-auto max-w-2xl">
                        <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/5 blur-3xl" />
                        <div className="flex items-center justify-center mb-6">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <HugeiconsIcon icon={ZapIcon} size={32} className="text-primary" />
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                            Empieza a scraping hoy
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                            Únete gratis, sin tarjeta de crédito. Tu primer endpoint en menos de un minuto.
                        </p>
                        <Button asChild size="lg" className="gap-2 text-base px-8 h-12">
                            <Link href="/login">
                                <HugeiconsIcon icon={ShieldKeyIcon} size={18} />
                                Conectar con GitHub
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
