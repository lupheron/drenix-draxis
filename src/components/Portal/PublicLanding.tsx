"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EyeLogo from "@/components/Icons/EyeLogo";
import EyeLoadingDefault from "@/components/UI/EyeLoadingDefault";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import TextareaDefault from "@/components/FormItems/Textarea/TextareaDefault";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import { useAccessLogin } from "@/hooks/useAccessLogin";
import { useAccessProfiles } from "@/hooks/useAccessProfiles";
import { useCreateAccessRequest } from "@/hooks/useCreateAccessRequest";
import { authStorage } from "@/lib/auth-storage";
import { formatApiError } from "@/utils/portal-errors";
import { cn } from "@/utils/cn";

type LoginTab = "request" | "admin" | "guest";

export default function PublicLanding() {
  const router = useRouter();
  const [tab, setTab] = useState<LoginTab>("request");
  const [ready, setReady] = useState(false);

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [guestUsername, setGuestUsername] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [profileId, setProfileId] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [reason, setReason] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminLogin = useAdminLogin();
  const accessLogin = useAccessLogin();
  const { data: profilesData, isLoading: profilesLoading } = useAccessProfiles();
  const createRequest = useCreateAccessRequest();

  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      router.replace("/command-center");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <EyeLoadingDefault size="lg" label="Loading" />
      </div>
    );
  }

  async function handleAdminLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await adminLogin.mutateAsync({
        username: adminUsername,
        password: adminPassword,
      });
      router.push("/command-center");
    } catch (loginError) {
      setError(formatApiError(loginError));
    }
  }

  async function handleGuestLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await accessLogin.mutateAsync({
        username: guestUsername,
        password: guestPassword,
      });
      router.push("/command-center");
    } catch (loginError) {
      setError(formatApiError(loginError));
    }
  }

  async function handleRequestAccess(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setRequestSuccess(false);

    try {
      await createRequest.mutateAsync({
        access_profile_id: Number(profileId),
        requester_name: requesterName.trim(),
        reason: reason.trim(),
      });
      setRequestSuccess(true);
      setRequesterName("");
      setReason("");
      setProfileId("");
    } catch (requestError) {
      setError(formatApiError(requestError));
    }
  }

  const tabs: { id: LoginTab; label: string }[] = [
    { id: "request", label: "Request Access" },
    { id: "admin", label: "Admin Login" },
    { id: "guest", label: "Guest Login" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_45%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <EyeLogo className="mb-4 h-12 w-12 text-foreground/80" />
          <h1 className="text-3xl font-light tracking-[0.35em] text-foreground">
            DRAXIS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Employee management portal
          </p>
        </div>

        <div className="w-full border border-border bg-surface p-8">
          <div className="mb-6 flex border-b border-border">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError(null);
                  setRequestSuccess(false);
                }}
                className={cn(
                  "flex-1 border-b-2 px-2 py-3 text-[10px] uppercase tracking-[0.12em] transition-colors sm:text-xs sm:tracking-[0.15em]",
                  tab === item.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {error ? (
            <p className="mb-4 rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {requestSuccess ? (
            <p className="mb-4 rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              Request submitted. Wait for admin approval.
            </p>
          ) : null}

          {tab === "request" ? (
            <form
              onSubmit={(event) => void handleRequestAccess(event)}
              className="space-y-4"
            >
              <SelectDefault
                label="Access profile"
                required
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                disabled={profilesLoading}
                options={[
                  { value: "", label: "Select a profile" },
                  ...(profilesData?.data.map((profile) => ({
                    value: String(profile.id),
                    label: `${profile.label} (${profile.company})`,
                  })) ?? []),
                ]}
              />
              <InputDefault
                label="Your name"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
              />
              <TextareaDefault
                label="Reason for access"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <ButtonDefault
                type="submit"
                className="w-full"
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? "Submitting..." : "Request access"}
              </ButtonDefault>
            </form>
          ) : null}

          {tab === "admin" ? (
            <form
              onSubmit={(event) => void handleAdminLogin(event)}
              className="space-y-4"
            >
              <InputDefault
                label="Username"
                required
                autoComplete="username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
              />
              <InputDefault
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <ButtonDefault
                type="submit"
                className="w-full"
                disabled={adminLogin.isPending}
              >
                {adminLogin.isPending ? "Signing in..." : "Sign in as admin"}
              </ButtonDefault>
            </form>
          ) : null}

          {tab === "guest" ? (
            <form
              onSubmit={(event) => void handleGuestLogin(event)}
              className="space-y-4"
            >
              <p className="text-xs text-muted-foreground">
                Use credentials given to you in person by an administrator.
              </p>
              <InputDefault
                label="Username"
                required
                autoComplete="username"
                value={guestUsername}
                onChange={(e) => setGuestUsername(e.target.value)}
              />
              <InputDefault
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
              />
              <ButtonDefault
                type="submit"
                className="w-full"
                disabled={accessLogin.isPending}
              >
                {accessLogin.isPending ? "Signing in..." : "Sign in as guest"}
              </ButtonDefault>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
