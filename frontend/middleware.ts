import { withAuth } from "next-auth/middleware";

export default withAuth(
    // Optional: add configuration here
    {
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: ["/endpoints/:path*", "/create/:path*"],
};
