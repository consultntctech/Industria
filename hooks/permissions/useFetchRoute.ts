import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { canUser, isSystemAdmin } from "@/Data/roles/permissions";
import { publicTableId, systemAdminOnlyTableId } from "@/Data/constants";

export const useFetchRoute = (tableIds: string[]) => {
  const { user } = useAuth();

 const hasPermission = (): boolean => {
  if (!user) return false;

  if (tableIds.includes(publicTableId)) return true;

  if (tableIds.includes(systemAdminOnlyTableId)) {
    return isSystemAdmin(user);
  }

  if (isSystemAdmin(user)) return true;

  return tableIds.some(tableId =>
    canUser(user, tableId, 'READ')
  );
};

  const { data = false, isLoading } = useQuery({
    queryKey: ['route-permission', user?._id, tableIds],
    queryFn: hasPermission,
    enabled: Boolean(user),
    staleTime: Infinity,
  });

  return { canAccess: data, isLoading };
};
