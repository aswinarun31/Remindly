import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Unauthorized = () => {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
                <ShieldX className="h-10 w-10 text-destructive" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
                <p className="mt-2 text-muted-foreground">
                    You don't have permission to view this page.
                    {user && (
                        <span className="block mt-1 text-sm">
                            Your role: <span className="font-medium capitalize text-primary">{user.role}</span>
                        </span>
                    )}
                </p>
            </div>
            <Button asChild>
                <Link to="/">Go to Dashboard</Link>
            </Button>
        </div>
    );
};

export default Unauthorized;
