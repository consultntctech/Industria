'use client';
import { useAuth } from "@/hooks/useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";
import { getOrgById } from "@/lib/actions/org.action";
import { IOrganization } from "@/lib/models/org.model";
import { useQuery } from "@tanstack/react-query";

export const useSettings = () => {
  const {user} = useAuth();
  // console.log('User: ', user)
  const fetchOrg = async ():Promise<IOrganization|null> => {
    try {
      if(!user) return null;
      const res = await getOrgById(user?.org);
      const org = res.payload as IOrganization;
      return org;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  const {data:org, isPending, isSuccess, refetch} = useQuery({
    queryKey: ['userOrg', user?.org],
    queryFn: fetchOrg,
    enabled: !!user?.org,
    // Picks up org changes made by system admins (e.g. a request to accept an
    // updated privacy policy) without the user reloading the page.
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })


  // console.log("org: ", org);

  return {
    primaryColour: org?.pcolor,
    secondaryColour: org?.scolor ,
    tertiaryColour: org?.tcolor ,
    appName: org?.appName || "Industra",
    appDescription: org?.description|| "Manage your industrial tasks with ease",
    logo: org?.logo || "/brand/industra-mark.svg",
    isPending, isSuccess, refetch,
    org
  };
};

/**
 * Whether the signed-in user's organization may create user accounts.
 * System-admin org users always can. While the org is loading this is false,
 * so "create user" controls never flash on for orgs that have it switched off.
 * The server enforces the same rule (lib/auth/userCreationPolicy.ts).
 */
export const useCanCreateUsers = (): boolean => {
  const { user } = useAuth();
  const { org } = useSettings();
  if (isSystemAdmin(user)) return true;
  if (!org) return false;
  return org.canCreateUsers !== false;
};
