import { getAllProductsWithStock, getAllProductsWithStockByOrg, getProducts, getProductsByOrg, getProductStats, getProductStatsByOrg } from "@/lib/actions/product.action";
import { IProduct, IProductWithStock } from "@/lib/models/product.model";
import { IProductStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchProducts = (type?:'Raw Material'|'Finished Good'|'Packaging') => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchProducts = async():Promise<IProduct[]>=>{
        try {
            if(!user) return [];
            const res = isAdmin ? await getProducts() : await getProductsByOrg(user?.org);
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
    const isAdmin = isSystemAdmin(user);
    const fetchStats = async():Promise<IProductStats[]>=>{
        try {
            if(!user) return [];
            const res = isAdmin ? await getProductStats() : await getProductStatsByOrg(user?.org);
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
    const isAdmin = isSystemAdmin(user);
    const fetchProducts = async():Promise<IProductWithStock[]>=>{
        try {
            if(!user) return []
            const res = isAdmin ? await getAllProductsWithStock() : await getAllProductsWithStockByOrg(user?.org);
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