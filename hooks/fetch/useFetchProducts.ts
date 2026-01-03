import { getAllProductsWithStock, getProducts, getProductStats } from "@/lib/actions/product.action";
import { IProduct, IProductWithStock } from "@/lib/models/product.model";
import { IProductStats } from "@/types/Types";
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



export const useFetchProductStats = () =>{
    const fetchStats = async():Promise<IProductStats[]>=>{
        try {
            const res = await getProductStats();
            return res.payload as IProductStats[];
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:stats=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['productStats'],
        queryFn: fetchStats,
    })
    
    return {stats, isPending, refetch, isSuccess}
}


export const useFetchProductsWithStock = () => {
    const fetchProducts = async():Promise<IProductWithStock[]>=>{
        try {
            const res = await getAllProductsWithStock();
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
  })

  return {products, isPending, refetch, isSuccess}
}