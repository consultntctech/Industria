'use client';
import { useAuth } from "@/hooks/useAuth";
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
  const {data:org, isPending} = useQuery({
    queryKey: ['userOrg', user?.org],
    queryFn: fetchOrg,
    enabled: !!user?.org,
  })


  // console.log("org: ", org);

  return {
    primaryColour: org?.pcolor || "#0076D1",
    secondaryColour: org?.scolor || "#1c80cc",
    tertiaryColour: org?.tcolor || "#005fa3",
    appName: org?.appName || "Industra",
    appDescription: org?.description|| "Manage your industrial tasks with ease",
    logo: org?.logo || "/images/bird-colorful-gradient-design-vector_343694-2506.jpg",
    isPending
  };
};