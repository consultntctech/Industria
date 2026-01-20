import { getCategories, getCategoriesByOrg } from "@/lib/actions/category.action";
import { ICategory } from "@/lib/models/category.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchProdCats = ()=>{
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchCats = async():Promise<ICategory[]>=>{
        try {
            if(!user) return [];
            const res = isAdmin ? await getCategories() : await getCategoriesByOrg(user?.org);
            const categories = res.payload as ICategory[];
            return categories.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:categories=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCats,
        enabled: !!user
    })

    return {categories, isPending, refetch, isSuccess}
}