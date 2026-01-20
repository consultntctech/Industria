'use client'

import { useRouter } from "next/navigation";
import { useFetchRoute } from "./useFetchRoute";
import { useEffect } from "react";
import { LinearProgress } from "@mui/material";
import ContentDeniedComp from "@/components/Views/ContentDeniedComp";
import { useFetchApprove } from "./useFetchApprove";
import { OperationName } from "@/types/Types";

interface PermissionGuardProps {
  tableId: string[];
  operation?: OperationName; // optional
  children: React.ReactNode;
}

export const PermissionGuard = ({
  tableId,
  operation = 'READ', // default
  children,
}: PermissionGuardProps) => {
  const router = useRouter();
  const { canAccess, isLoading, isSuccess } = useFetchRoute(tableId, operation);

  useEffect(() => {
    if (isSuccess && !canAccess) {
      router.replace('/dashboard/denied');
    }
  }, [isLoading, canAccess, router]);

  if (isLoading || !canAccess) {
    return <LinearProgress className="w-full" />;
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

  if (isSuccess && !canAccess) {
    return <ContentDeniedComp />;
  }

  return <>{children}</>;
};
