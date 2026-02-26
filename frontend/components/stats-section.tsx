"use client";

import { useEffect, useState } from "react";
import { statsApi } from "@/lib/api";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";
import {
    ApiIcon,
    UserGroupIcon,
    PieChart01Icon,
    BarChartIcon,
    TimeScheduleIcon,
    Loading02Icon,
} from "@hugeicons/core-free-icons";

interface Stats {
    total_endpoints: number;
    online_users: number;
    total_unique_visitors: number;
    visitor_history: Array<{
        ip: string;
        first_seen: string;
        last_seen: string;
        visits: number;
    }>;
}

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

function StatCard({ icon, label, value, accent }: { icon: IconType; label: string; value: string | number; accent?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border border-border/60 bg-background/60 backdrop-blur-sm hover:border-primary/40 transition-all group">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-1 ${accent ?? "bg-primary/10"} group-hover:scale-110 transition-transform`}>
                <HugeiconsIcon icon={icon} size={22} className="text-primary" />
            </div>
            <p className="text-3xl font-extrabold tabular-nums tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground text-center">{label}</p>
        </div>
    );
}

export default function StatsSection() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchStats = async () => {
        try {
            const res = await statsApi.get();
            setStats(res.data);
            setLastRefresh(new Date());
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="w-full py-20 md:py-28 border-y border-border/50 bg-muted/20">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-400 font-medium mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        En vivo · actualiza cada 30s
                        {loading && <HugeiconsIcon icon={Loading02Icon} size={11} className="animate-spin ml-1" />}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Plataforma en crecimiento
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        Métricas reales de la plataforma, actualizadas en tiempo real.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <StatCard
                        icon={ApiIcon}
                        label="Endpoints activos"
                        value={stats ? stats.total_endpoints.toLocaleString() : "—"}
                        accent="bg-violet-500/10"
                    />
                    <StatCard
                        icon={UserGroupIcon}
                        label="Usuarios en línea ahora"
                        value={stats ? stats.online_users : "—"}
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        icon={PieChart01Icon}
                        label="Visitantes únicos"
                        value={stats ? stats.total_unique_visitors.toLocaleString() : "—"}
                        accent="bg-cyan-500/10"
                    />
                    <StatCard
                        icon={BarChartIcon}
                        label="Total de visitas"
                        value={
                            stats
                                ? stats.visitor_history.reduce((a, v) => a + v.visits, 0).toLocaleString()
                                : "—"
                        }
                        accent="bg-amber-500/10"
                    />
                </div>

                {/* Visitor History */}
                {stats && stats.visitor_history.length > 0 && (
                    <div className="rounded-xl border border-border/50 bg-background/40 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <HugeiconsIcon icon={TimeScheduleIcon} size={14} className="text-muted-foreground" />
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-xs">
                                Historial de visitantes — últimas 20 sesiones
                            </p>
                            <span className="ml-auto text-xs text-muted-foreground/50">
                                {lastRefresh.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {stats.visitor_history.map((v) => (
                                <div
                                    key={v.ip}
                                    title={`Primera visita: ${new Date(v.first_seen).toLocaleString("es-DO")}\nÚltima visita: ${new Date(v.last_seen).toLocaleString("es-DO")}`}
                                    className="flex items-center gap-1.5 text-xs bg-muted/50 border border-border/40 px-3 py-1.5 rounded-full cursor-default hover:border-primary/30 transition-colors"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                    <span className="font-mono text-muted-foreground">{v.ip}</span>
                                    <span className="text-muted-foreground/40">·</span>
                                    <span className="text-muted-foreground font-medium">{v.visits}v</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
