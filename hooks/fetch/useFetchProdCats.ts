import { getCategories } from "@/lib/actions/category.action";
import { ICategory } from "@/lib/models/category.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchProdCats = ()=>{
    const fetchCats = async():Promise<ICategory[]>=>{
        try {
            const res = await getCategories();
            const categories = res.payload as ICategory[];
            return categories;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:categories=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCats,
    })

    return {categories, isPending, refetch, isSuccess}
}