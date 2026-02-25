import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * This page is the redirect target after Google OAuth.
 * The backend redirects to: /auth/callback?token=<JWT>
 * We extract the token, store it, fetch the user, then navigate to home.
 */
const AuthCallback = () => {
    const [params] = useSearchParams();
    const { setTokenAndUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get("token");
        const error = params.get("error");

        if (error || !token) {
            toast.error("Google sign-in failed. Please try again.");
            navigate("/login");
            return;
        }

        setTokenAndUser(token)
            .then(() => {
                toast.success("Signed in with Google!");
                navigate("/");
            })
            .catch(() => {
                toast.error("Authentication failed");
                navigate("/login");
            });
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Completing sign-in…</p>
            </div>
        </div>
    );
};

export default AuthCallback;
