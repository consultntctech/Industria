import { isSystemAdmin } from "@/Data/roles/permissions";
import { useAuth } from "../useAuth";
import { IEquipment } from "@/lib/models/equipment.model";
import { getEquipments, getEquipmentsByOrg, getEquipmentsByType, getEquipmentStatsByOrg } from "@/lib/actions/equipment.action";
import { useQuery } from "@tanstack/react-query";
import { IEquipmentStatsPayload } from "@/types/EquipmentTypes";

export const useFetchEquipment = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchEquipment = async ():Promise<IEquipment[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getEquipments() : await getEquipmentsByOrg(user?.org);
            const data = res.payload as IEquipment[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:equipment=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['equipment'],
        queryFn: fetchEquipment,
        enabled: !!user
    })
    return {equipment, isPending, refetch, isSuccess}
}


export const useFetchEquipmentByType = (typeId:string) => {
    const fetchEquipment = async ():Promise<IEquipment[]> => {
        try {
            if(!typeId) return [];
            const res = await getEquipmentsByType(typeId);
            const data = res.payload as IEquipment[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
  const {data:equipment=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['equipment-by-type', typeId],
    queryFn: fetchEquipment,
    enabled: !!typeId
  })
  return {equipment, isPending, refetch, isSuccess}
}


export const useFetchEquipmentStats = (limit?:number) => {
    const {user} = useAuth();
    // const isAdmin = isSystemAdmin(user);
    const fetchEquipment = async ():Promise<IEquipmentStatsPayload> => {
        try {
            if(!user) return {monthly:{Available:[], 'In Use':[], Maintenance:[]}, groupedByCategory:[], groupedByType:[], allTime:{Available:{count:0, price:0}, 'In Use':{count:0, price:0}, Maintenance:{count:0, price:0}}};
            const res = await getEquipmentStatsByOrg(user?.org, limit);
            const data = res.payload as IEquipmentStatsPayload;
            console.log('res: ', res)
            return data;
        } catch (error) {
            console.log(error);
            return {monthly:{Available:[], 'In Use':[], Maintenance:[]}, groupedByCategory:[], groupedByType:[], allTime:{Available:{count:0, price:0}, 'In Use':{count:0, price:0}, Maintenance:{count:0, price:0}}};
        }
    }

  const {data:equipmentStats={monthly:{Available:[], 'In Use':[], Maintenance:[]}, groupedByCategory:[], groupedByType:[], allTime:{Available:{count:0, price:0}, 'In Use':{count:0, price:0}, Maintenance:{count:0, price:0}}}, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['equipment-stats', limit],
    queryFn: fetchEquipment,
    enabled: !!user
  })
  return {equipmentStats, isPending, refetch, isSuccess}
};