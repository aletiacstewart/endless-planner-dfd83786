import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { useEntitlements } from "@/hooks/useEntitlements";

/**
 * Owner-only test access. Access is granted by the `admin` role stored in the
 * database for the signed-in account — there is no bypass key in the codebase.
 */
export default function AdminPlanner() {
  const navigate = useNavigate();
  const { loading, admin, userId } = useEntitlements();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="planner-card max-w-md w-full text-center">
        {loading ? (
          <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
        ) : admin ? (
          <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-primary" />
        ) : (
          <ShieldAlert className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        )}
        <h1 className="font-display text-2xl mb-2">
          {loading ? "Checking access…" : admin ? "Admin access active" : "Not available"}
        </h1>
        <p className="text-muted-foreground">
          {loading
            ? "Verifying your account with the server."
            : admin
              ? "Your account has the admin role, so every planner and cover pack is unlocked for testing."
              : userId
                ? "This account doesn't have admin access."
                : "Sign in with an admin account to use this page."}
        </p>
        <div className="mt-6 flex justify-center gap-4 text-sm">
          {admin && (
            <button onClick={() => navigate("/app", { replace: true })} className="underline">
              Open the planner
            </button>
          )}
          {!admin && !loading && !userId && (
            <button onClick={() => navigate("/auth")} className="underline">
              Sign in
            </button>
          )}
          <button onClick={() => navigate("/")} className="underline">
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
