import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "github" && profile) {
                try {
                    // Sync user to our backend DB
                    const response = await axios.post(`${BACKEND_URL}/auth/github`, {
                        github_id: String((profile as any).id),
                        username: (profile as any).login,
                        email: user.email,
                        avatar_url: user.image,
                        name: user.name,
                    });

                    // SAVE BACKEND TOKEN and user data to the user object temporarily so it passes to JWT callback
                    if (response.data.access_token) {
                        (user as any).accessToken = response.data.access_token;
                        (user as any).isAdmin = response.data.user.is_admin;
                        (user as any).credits = response.data.user.credits;
                        (user as any).totalRequests = response.data.user.total_requests;
                    }
                } catch (err) {
                    console.error("[NextAuth] Failed to sync user to backend:", err);
                }
            }
            return true;
        },
        async jwt({ token, user, profile }) {
            if (profile) {
                token.login = (profile as any).login;
            }
            if (user && (user as any).accessToken) {
                token.accessToken = (user as any).accessToken;
                token.isAdmin = (user as any).isAdmin;
                token.credits = (user as any).credits;
                token.totalRequests = (user as any).totalRequests;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).githubUsername = token.login as string;
                (session.user as any).githubId = token.sub as string;
                (session.user as any).accessToken = token.accessToken as string;
                (session.user as any).isAdmin = token.isAdmin as boolean;
                (session.user as any).credits = token.credits as number;
                (session.user as any).totalRequests = token.totalRequests as number;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
