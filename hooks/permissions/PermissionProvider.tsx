'use client'

import { useRouter } from "next/navigation";
import { useFetchRoute } from "./useFetchRoute";
import { useEffect } from "react";
import { LinearProgress } from "@mui/material";
import ContentDeniedComp from "@/components/Views/ContentDeniedComp";
import { useFetchApprove } from "./useFetchApprove";

interface PermissionGuardProps {
  tableId: string[];
  children: React.ReactNode;
}

export const PermissionGuard = ({
  tableId,
  children,
}: PermissionGuardProps) => {
  const router = useRouter();
  const { canAccess, isLoading } = useFetchRoute(tableId);

  useEffect(() => {
    if (!isLoading && !canAccess) {
      router.replace('/dashboard/denied');
    }
  }, [isLoading, canAccess, router]);

  if (isLoading || !canAccess) {
    return <LinearProgress className="w-full" />; // or <Spinner />
  }

  return <>{children}</>;
};


export const ApprovalGuard = ({
  tableId,
  children,
}: PermissionGuardProps) => {
  const { canAccess, isLoading, isSuccess } = useFetchApprove(tableId);

  if (isLoading) {
    return <LinearProgress className="w-full" />;
  }

  if (!canAccess && isSuccess) {
    return <ContentDeniedComp />;
  }

  return <>{children}</>;
};
