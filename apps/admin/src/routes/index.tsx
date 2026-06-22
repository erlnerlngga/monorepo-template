import { useTranslation } from "@repo/i18n";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { toast } from "@repo/ui/components/sonner";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { meQueryOptions, useLogoutMutation } from "../modules/auth/hooks/use-auth";
import { UnauthorizedError } from "../modules/auth/services";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw redirect({ to: "/login" });
      }

      throw error;
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const user = useQuery(meQueryOptions);
  const logoutMutation = useLogoutMutation();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onError: (error) => {
        const message = error instanceof Error ? error.message : t("dashboard.logoutFallbackError");
        toast.error(message);
      },
    });
  }

  if (!user.data) {
    return null;
  }

  if (user.data.role !== "admin") {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{t("dashboard.forbidden.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">{t("dashboard.forbidden.description")}</p>
          <Button
            className="w-fit"
            type="button"
            variant="outline"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
          >
            {logoutMutation.isPending ? t("dashboard.logoutPending") : t("dashboard.logout")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("dashboard.session")}
            <Badge>{user.data.role ?? "user"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1 text-sm">
            <span className="text-muted-foreground">{t("dashboard.email")}</span>
            <span>{user.data.email}</span>
          </div>
          <Button
            className="w-fit"
            type="button"
            variant="outline"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
          >
            {logoutMutation.isPending ? t("dashboard.logoutPending") : t("dashboard.logout")}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
