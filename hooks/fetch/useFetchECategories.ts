import { IECategory } from "@/lib/models/ecategory.model";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";
import { getECategories, getECategoriesByOrg } from "@/lib/actions/ecategory.action";
import { useQuery } from "@tanstack/react-query";

export const useFetchECategories = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchECategories = async ():Promise<IECategory[]> => {
        try {
            if(!user) return [];
            const res = isAdmin? await getECategories() : await getECategoriesByOrg(user?.org);
            const data = res.payload as IECategory[];
            return data?.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

  const {data:categories=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['ecategories'],
    queryFn: fetchECategories,
    enabled: !!user
  })
  return {categories, isPending, refetch, isSuccess}
}