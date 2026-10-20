import { getAllProductsWithStockByOrg,  getProductsByOrg, getProductStatsByOrg } from "@/lib/actions/product.action";
import { IProduct, IProductWithStock } from "@/lib/models/product.model";
import { IProductStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";

export const useFetchProducts = (type?:'Raw Material'|'Finished Good'|'Packaging') => {
    const {user} = useAuth();
    const fetchProducts = async():Promise<IProduct[]>=>{
        try {
            if(!user) return [];
            const res = await getProductsByOrg(user?.org);
            const products = res.payload as IProduct[];
            const data = products.filter(product=> !type ? true : product.type === type);
            return data.sort((a,b)=>a.name.localeCompare(b.name));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:products=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['products', type],
        queryFn: fetchProducts,
        enabled: !!user
    })

    return {products, isPending, refetch, isSuccess}
}



export const useFetchProductStats = () =>{
    const {user} = useAuth();
    const fetchStats = async():Promise<IProductStats[]>=>{
        try {
            if(!user) return [];
            const res = await getProductStatsByOrg(user?.org);
            return res.payload as IProductStats[];
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:stats=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['productStats'],
        queryFn: fetchStats,
        enabled: !!user
    })
    
    return {stats, isPending, refetch, isSuccess}
}


export const useFetchProductsWithStock = () => {
    const {user} = useAuth();
    const fetchProducts = async():Promise<IProductWithStock[]>=>{
        try {
            if(!user) return []
            const res = await getAllProductsWithStockByOrg(user?.org);
            const products = res.payload as IProductWithStock[];
            return products.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

  const {data:products=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['productswithstock'],
    queryFn: fetchProducts,
    enabled: !!user
  })

  return {products, isPending, refetch, isSuccess}
}