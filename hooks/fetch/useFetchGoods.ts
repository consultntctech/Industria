import { getAvailableGoods, getGoods } from "@/lib/actions/good.action";
import { IGood } from "@/lib/models/good.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchGoods = () => {
    const fetchGoods = async ():Promise<IGood[]> => {
        try {
            const res = await getGoods();
            const data = res.payload as IGood[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:goods=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['goods'],
        queryFn: fetchGoods,
    })
    return {goods, isPending, refetch, isSuccess}
}


export const useFetchAvailableGoods = () => {
    const fetchAvailableGoods = async ():Promise<IGood[]> => {
        try {
            const res = await getAvailableGoods();
            const data = res.payload as IGood[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:goods=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['availableGoods'],
        queryFn: fetchAvailableGoods,
    })
    return {goods, isPending, refetch, isSuccess}
}