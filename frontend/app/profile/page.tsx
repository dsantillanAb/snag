"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserCircleIcon,
    GridViewIcon,
    DollarCircleIcon,
    Settings02Icon,
    Mail01Icon,
    Calendar03Icon,
} from "@hugeicons/core-free-icons";
import api from "@/lib/api";

interface UserProfile {
    id: string;
    username: string;
    email: string | null;
    avatar_url: string | null;
    name: string | null;
    credits: number;
    total_requests: number;
    is_admin: boolean;
    created_at: string;
    endpoint_count: number;
}

interface EndpointUsage {
    id: string;
    endpoint_slug: string;
    request_count: number;
    credits_used: number;
    created_at: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [endpoints, setEndpoints] = useState<EndpointUsage[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingCredits, setAddingCredits] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [creditAmount, setCreditAmount] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (status === "authenticated") {
            loadProfile();
            if (activeTab === "endpoints") {
                loadEndpoints();
            }
            if (activeTab === "admin" && (session?.user as any)?.isAdmin) {
                loadAllUsers();
            }
        }
    }, [status, activeTab]);

    const loadProfile = async () => {
        try {
            const response = await api.get("/users/me");
            setProfile(response.data);
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadEndpoints = async () => {
        try {
            const response = await api.get("/users/me/endpoints");
            setEndpoints(response.data);
        } catch (error) {
            console.error("Error loading endpoints:", error);
        }
    };

    const loadAllUsers = async () => {
        try {
            const response = await api.get("/users/admin/all");
            setAllUsers(response.data);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const handleAddCredits = async () => {
        if (!selectedUserId || !creditAmount) return;

        setAddingCredits(true);
        try {
            await api.post("/users/admin/add-credits", {
                user_id: selectedUserId,
                amount: parseFloat(creditAmount),
            });
            alert("Créditos agregados exitosamente");
            setCreditAmount("");
            setSelectedUserId("");
            loadAllUsers();
        } catch (error) {
            console.error("Error adding credits:", error);
            alert("Error al agregar créditos");
        } finally {
            setAddingCredits(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-64 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
                <p className="text-muted-foreground">Gestiona tu cuenta y revisa tu uso</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    onClick={() => setActiveTab("profile")}
                    className="gap-2"
                >
                    <HugeiconsIcon icon={UserCircleIcon} size={16} />
                    Perfil
                </Button>
                <Button
                    variant={activeTab === "endpoints" ? "default" : "ghost"}
                    onClick={() => setActiveTab("endpoints")}
                    className="gap-2"
                >
                    <HugeiconsIcon icon={GridViewIcon} size={16} />
                    Endpoints
                </Button>
                <Button
                    variant={activeTab === "usage" ? "default" : "ghost"}
                    onClick={() => setActiveTab("usage")}
                    className="gap-2"
                >
                    <HugeiconsIcon icon={DollarCircleIcon} size={16} />
                    Uso y Créditos
                </Button>
                {profile.is_admin && (
                    <Button
                        variant={activeTab === "admin" ? "default" : "ghost"}
                        onClick={() => setActiveTab("admin")}
                        className="gap-2"
                    >
                        <HugeiconsIcon icon={Settings02Icon} size={16} />
                        Admin
                    </Button>
                )}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Tus datos de perfil</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                {profile.avatar_url && (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.name || profile.username}
                                        className="h-20 w-20 rounded-full border-2"
                                    />
                                )}
                                <div>
                                    <h3 className="text-xl font-bold">{profile.name || profile.username}</h3>
                                    <p className="text-muted-foreground">@{profile.username}</p>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <HugeiconsIcon icon={Mail01Icon} size={16} className="text-muted-foreground" />
                                    <span>{profile.email || "No email"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <HugeiconsIcon icon={Calendar03Icon} size={16} className="text-muted-foreground" />
                                    <span>Miembro desde {new Date(profile.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">${profile.credits.toFixed(2)}</div>
                                    <div className="text-sm text-muted-foreground">Créditos disponibles</div>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <div className="text-2xl font-bold">{profile.endpoint_count}{profile.is_admin ? "" : "/3"}</div>
                                    <div className="text-sm text-muted-foreground">Endpoints creados{profile.is_admin ? " (sin límite)" : ""}</div>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <div className="text-2xl font-bold">{profile.total_requests}</div>
                                    <div className="text-sm text-muted-foreground">Requests totales</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Endpoints Tab */}
            {activeTab === "endpoints" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mis Endpoints</CardTitle>
                        <CardDescription>Endpoints que has creado y su uso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {endpoints.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No has creado ningún endpoint aún</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Endpoint</TableHead>
                                        <TableHead>Requests</TableHead>
                                        <TableHead>Créditos Usados</TableHead>
                                        <TableHead>Creado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {endpoints.map((ep) => (
                                        <TableRow key={ep.id}>
                                            <TableCell className="font-mono text-sm">{ep.endpoint_slug}</TableCell>
                                            <TableCell>
                                                <Badge variant={ep.request_count >= 1000 ? "destructive" : "default"}>
                                                    {ep.request_count}/1000
                                                </Badge>
                                            </TableCell>
                                            <TableCell>${ep.credits_used.toFixed(2)}</TableCell>
                                            <TableCell>{new Date(ep.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Usage Tab */}
            {activeTab === "usage" && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HugeiconsIcon icon={DollarCircleIcon} size={24} />
                                Balance de Créditos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-6 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        ${profile.credits.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">Créditos disponibles</div>
                                    <div className="mt-4 text-sm">
                                        <div className="flex justify-between">
                                            <span>Requests restantes (aprox):</span>
                                            <span className="font-bold">{Math.floor(profile.credits / 0.03)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">Total de requests</div>
                                        <div className="text-2xl font-bold">{profile.total_requests}</div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">Costo por request</div>
                                        <div className="text-2xl font-bold">$0.03</div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <h4 className="font-semibold mb-2">Información de Uso</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Cada request a tus endpoints cuesta $0.03 USD</li>
                                        <li>• Límite de 1000 requests por endpoint</li>
                                        {!profile.is_admin && <li>• Máximo 3 endpoints por usuario</li>}
                                        {profile.is_admin && <li>• ⭐ Sin límite de endpoints (Admin)</li>}
                                        <li>• Créditos iniciales: $30.00 USD</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Admin Tab */}
            {activeTab === "admin" && profile.is_admin && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agregar Créditos a Usuario</CardTitle>
                            <CardDescription>Gestiona los créditos de los usuarios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                >
                                    <option value="">Seleccionar usuario</option>
                                    {allUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username} - ${user.credits.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    type="number"
                                    placeholder="Cantidad"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(e.target.value)}
                                    className="w-32"
                                />
                                <Button onClick={handleAddCredits} disabled={addingCredits || !selectedUserId || !creditAmount}>
                                    {addingCredits ? "Agregando..." : "Agregar"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Todos los Usuarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Créditos</TableHead>
                                        <TableHead>Endpoints</TableHead>
                                        <TableHead>Requests</TableHead>
                                        <TableHead>Rol</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>{user.email || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.credits < 1 ? "destructive" : "default"}>
                                                    ${user.credits.toFixed(2)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.endpoint_count}{user.is_admin ? "" : "/3"}</TableCell>
                                            <TableCell>{user.total_requests}</TableCell>
                                            <TableCell>
                                                {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
