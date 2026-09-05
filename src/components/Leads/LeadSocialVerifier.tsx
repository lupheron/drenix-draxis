"use client";

import { useState } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import { useVerifyLeadSocials } from "@/hooks/useVerifyLeadSocials";
import type { LeadSocialVerificationData } from "@/types/lead-verification";
import {
  resolveTelegramBadge,
  resolveWhatsappBadge,
  type SocialPlatformBadgeView,
} from "@/utils/lead-social-status";
import { isValidPhoneForVerification, telegramChatUrl, whatsAppChatUrl } from "@/utils/phone";
import { formatApiError } from "@/utils/portal-errors";
import { cn } from "@/utils/cn";

type Props = {
  phone: string | null | undefined;
  /** Inline badges only — no outer border */
  compact?: boolean;
  className?: string;
};

const toneStyles = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/40 bg-danger/10 text-danger",
  muted: "border-border bg-surface text-muted-foreground",
} as const;

function PlatformBadge({
  platform,
  view,
  compact,
  href,
}: {
  platform: string;
  view: SocialPlatformBadgeView;
  compact?: boolean;
  href?: string;
}) {
  const className = cn(
    "inline-flex max-w-full items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]",
    toneStyles[view.tone],
    href && "cursor-pointer transition-opacity hover:opacity-90",
  );

  const content = (
    <>
      <span className="truncate">
        {compact ? view.shortLabel : view.longLabel}
      </span>
      <span className="opacity-70">
        · {platform}
        {href ? " ↗" : ""}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={`${view.hint} — Open in ${platform}`}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={className} title={view.hint}>
      {content}
    </span>
  );
}

function SearchLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] uppercase tracking-[0.12em] text-muted underline-offset-2 hover:text-foreground hover:underline"
    >
      {label} →
    </a>
  );
}

function ResultPanel({
  data,
  compact,
}: {
  data: LeadSocialVerificationData;
  compact?: boolean;
}) {
  const whatsapp = resolveWhatsappBadge(data);
  const telegram = resolveTelegramBadge(data);
  const whatsappHref =
    data.whatsapp || data.whatsapp_status === "valid"
      ? whatsAppChatUrl(data.phone)
      : undefined;
  const telegramHref =
    data.telegram || data.telegram_status === "found"
      ? telegramChatUrl(data.phone)
      : undefined;
  const showPrivacyNote =
    !data.telegram &&
    (data.telegram_status === "not_found_or_hidden" || !data.telegram_status);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <PlatformBadge
          platform="WhatsApp"
          view={whatsapp}
          compact={compact}
          href={whatsappHref}
        />
        <PlatformBadge
          platform="Telegram"
          view={telegram}
          compact={compact}
          href={telegramHref}
        />
      </div>

      {!whatsappHref || !telegramHref ? (
        <div className="flex flex-wrap gap-3">
          {!whatsappHref ? (
            <SearchLink href={whatsAppChatUrl(data.phone)} label="Try WhatsApp" />
          ) : null}
          {!telegramHref ? (
            <SearchLink href={telegramChatUrl(data.phone)} label="Try Telegram" />
          ) : null}
        </div>
      ) : null}

      {showPrivacyNote ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Telegram often hides numbers from API lookup when users set{" "}
          <span className="text-foreground">Privacy → Phone number → Nobody</span>.
          Your Telegram app may still show a name if you have chatted with them.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SearchLink href={data.facebook_search_url} label="Facebook search" />
        <SearchLink href={data.instagram_search_url} label="Instagram" />
      </div>
      <p className="text-[10px] text-muted">Checked {data.phone}</p>
    </div>
  );
}

export default function LeadSocialVerifier({
  phone,
  compact = false,
  className,
}: Props) {
  const verify = useVerifyLeadSocials();
  const [result, setResult] = useState<LeadSocialVerificationData | null>(null);

  const valid = isValidPhoneForVerification(phone);

  async function handleVerify() {
    if (!phone?.trim()) return;
    setResult(null);
    try {
      const response = await verify.mutateAsync(phone);
      setResult(response.data);
    } catch {
      /* error shown below */
    }
  }

  if (!valid) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Add a valid phone number to verify WhatsApp & Telegram.
      </p>
    );
  }

  return (
    <div
      className={cn(
        !compact && "border border-border bg-surface-elevated/40 p-4",
        className,
      )}
    >
      {!compact ? (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Social verification
        </p>
      ) : null}

      <div className={cn("flex flex-wrap items-center gap-3", !compact && "mt-3")}>
        <ButtonDefault
          type="button"
          size="sm"
          variant={compact ? "outline" : "primary"}
          disabled={verify.isPending}
          onClick={() => void handleVerify()}
        >
          {verify.isPending ? "Checking…" : "Verify socials"}
        </ButtonDefault>
      </div>

      {verify.isError ? (
        <p className="mt-2 text-xs text-danger">{formatApiError(verify.error)}</p>
      ) : null}

      {result ? (
        <div className={cn(compact ? "mt-2" : "mt-3")}>
          <ResultPanel data={result} compact={compact} />
        </div>
      ) : null}
    </div>
  );
}
