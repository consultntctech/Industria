'use client'
import { hasTablePermission, isGlobalAdmin, isSystemAdmin, normalizeRoles } from "@/Data/roles/permissions";
import { checkRolesUpdated, getUserPermissions } from "@/lib/actions/role.action";
import { queryClient } from "@/lib/queryClient";
// import { updateUserRoles } from "@/lib/actions/user.action";
import { getSession } from "@/lib/session";
import { ISession, ISessionRole, OperationName } from "@/types/Types"
import { skipToken, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
// import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";

export const useAuth = ()=>{
    const fetchUser = async():Promise<ISession|null>=>{
        try {
            const user = await getSession();
            return user;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:user, isPending:authLoading, refetch, isSuccess} = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
    })

    return {user, authLoading, refetch, isSuccess}
}


// export const useUpdatedUser = ()=>{
//     const {user} = useAuth();
//     const fetchPermision = async():Promise<ISession|null>=>{
//         try {
//             if(!user) return null;
//             const res = await updateUserRoles(user?._id);
//             if(!res.error){
//                 enqueueSnackbar(res.message, {variant:res.error?'error':'success', autoHideDuration:30_000});
//                 return res.payload as ISession;
//             }else{
//                 return null;
//             }
//         } catch (error) {
//             console.log(error);
//             return null;
//         }
//     }
    
//     const {data:userData, isPending, refetch, isSuccess} = useQuery({
//         queryKey: ['userpermisions', user?._id],
//         queryFn: fetchPermision,
//         enabled: !!user,
//         refetchInterval: 30_000,
//         refetchIntervalInBackground: true,
//     })

//     return {user, userData, isPending, refetch, isSuccess}
// }


// useAuth.ts
// useAuth.ts
// useAuth.ts
export const usePermissions = () => {
  const { user } = useAuth();

  const fetchDirtyFlag = async () => {
    if (!user) return false;
    const res = await checkRolesUpdated(user._id);
    const payload = res.payload as { dirty: boolean };
    return payload?.dirty;
  };

  const { data: isDirty } = useQuery({
    queryKey: ['roles-dirty', user?._id],
    queryFn: fetchDirtyFlag,
    enabled: !!user,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  const fetchPermissions = async (): Promise<ISessionRole[]> => {
    if (!user) return [];
    const res = await getUserPermissions(user._id);
    return res.error ? [] : (res.payload as ISessionRole[]);
  };

  useEffect(() => {
    if (isDirty && user) {
      queryClient
        .fetchQuery({
          queryKey: ['permissions', user._id],
          queryFn: fetchPermissions,
        })
        .then(() => {
          enqueueSnackbar('Your permissions have been updated', { variant: 'info' });
        });
    }
  }, [isDirty, user]);

  return useQuery({
    queryKey: ['permissions', user?._id],
    queryFn: fetchPermissions,
    enabled: !!user,
    staleTime: Infinity,
  });
};

export const useIsGlobalAdmin = () => {
  const { user } = useAuth();
  const { data: roles } = useQuery<ISessionRole[]>({
    queryKey: ['permissions', user?._id],
    queryFn: skipToken,
  });
  return isGlobalAdmin(roles);
};


export const useCanUser = (tableId: string, operation: OperationName): boolean => {
  const { user } = useAuth();
  const { data: roles } = useQuery<ISessionRole[]>({
    queryKey: ['permissions', user?._id],
    queryFn: skipToken,
  });

  if (!user) return false;
  if (isSystemAdmin(user)) return true;
  if (isGlobalAdmin(roles)) return true;
  return hasTablePermission(normalizeRoles(roles), tableId, operation);
};

export const useSessionWithPermissions = () => {
  const { user, authLoading, isSuccess: authSuccess } = useAuth();
  const { data: permissions = [], isPending: permsLoading, isSuccess: permsSuccess } = usePermissions();

  const effectiveUser = user ? { ...user, roles: permissions } as ISession : null;

  return {
    user: effectiveUser,
    isLoading: authLoading || permsLoading,
    isSuccess: authSuccess && permsSuccess,
  };
};