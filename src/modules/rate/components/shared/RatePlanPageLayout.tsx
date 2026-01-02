import { ReactNode } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { NotFoundState } from "./NotFoundState";

interface RatePlanPageLayoutProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  notFound?: boolean;
  notFoundMessage?: string;
  maxWidth?: "4xl" | "6xl";
  children: ReactNode;
  loadingTitle?: string;
  loadingSubtitle?: string;
}

export function RatePlanPageLayout({
  title,
  subtitle,
  isLoading = false,
  error,
  notFound = false,
  notFoundMessage,
  maxWidth = "6xl",
  children,
  loadingTitle,
  loadingSubtitle,
}: RatePlanPageLayoutProps) {
  if (isLoading) {
    return (
      <PageWrapper title={title} subtitle={subtitle}>
        <LoadingState
          title={loadingTitle}
          subtitle={loadingSubtitle}
          height="h-96"
        />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title={title} subtitle={subtitle}>
        <ErrorState title="Error" message={error} />
      </PageWrapper>
    );
  }

  if (notFound) {
    return (
      <PageWrapper title={title} subtitle={subtitle}>
        <NotFoundState
          title="Not Found"
          message={notFoundMessage || `${title} not found`}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={title} subtitle={subtitle}>
      <div className={`max-w-${maxWidth} mx-auto`}>{children}</div>
    </PageWrapper>
  );
}
