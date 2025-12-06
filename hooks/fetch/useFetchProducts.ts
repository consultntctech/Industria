import { getProducts } from "@/lib/actions/product.action";
import { IProduct } from "@/lib/models/product.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchProducts = (type?:'Raw Material'|'Finished Good'|'Packaging') => {
    const fetchProducts = async():Promise<IProduct[]>=>{
        try {
            const res = await getProducts();
            const products = res.payload as IProduct[];
            const data = products.filter(product=> !type ? true : product.type === type);
            return data.sort((a,b)=>a.name.localeCompare(b.name));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:products=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    })

    return {products, isPending, refetch, isSuccess}
}