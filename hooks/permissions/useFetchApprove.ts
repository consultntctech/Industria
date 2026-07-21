import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from '../useAuth';
import { hasTablePermission, isGlobalAdmin, isSystemAdmin, normalizeRoles } from "@/Data/roles/permissions";
import { publicTableId, systemAdminOnlyTableId } from "@/Data/constants";
import { useMemo } from "react";
import { ISessionRole } from "@/types/Types";

export const useFetchApprove = (tableIds: string[]) => {
  const { user } = useAuth();

  const { data: roles, isLoading: rolesLoading, isSuccess: rolesSuccess } = useQuery<ISessionRole[]>({
    queryKey: ['permissions', user?._id],
    queryFn: skipToken,
    enabled: Boolean(user),
  });

  const canAccess = useMemo(() => {
    if (!user) return false;
    if (tableIds.includes(publicTableId)) return true;
    if (tableIds.includes(systemAdminOnlyTableId)) return isSystemAdmin(user);
    if (isSystemAdmin(user)) return true;
    if (isGlobalAdmin(roles)) return true;

    const normalized = normalizeRoles(roles);
    return tableIds.some(tableId => hasTablePermission(normalized, tableId, 'APPROVE'));
  }, [user, roles, tableIds]);

  return {
    canAccess,
    isLoading: Boolean(user) && rolesLoading,
    isSuccess: Boolean(user) && rolesSuccess,
  };
};
