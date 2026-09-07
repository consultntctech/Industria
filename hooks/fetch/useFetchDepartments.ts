import { useAuth } from "../useAuth";
import { IDepartment } from "@/lib/models/department.model";
import {  getDepartmentsByOrg } from "@/lib/actions/department.action";
import { useQuery } from "@tanstack/react-query";
import { isSystemAdmin } from "@/Data/roles/permissions";



export const useFetchDepartments = () => {
    const {user} = useAuth();

    const fetchDepartments = async():Promise<IDepartment[]>=>{
        try {
            if(!user) return [];
            const res = await getDepartmentsByOrg(user?.org);
            const data =  res.payload as IDepartment[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:departments=[], isPending, refetch} = useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
    });

    return {departments, isPending, refetch}
}


export const useFetchDepartmentByOrg = (orgId?:string) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const id = isAdmin ? orgId : user?.org;
    const fetchDepartments = async():Promise<IDepartment[]>=>{
        try {
            if(!user || !id) return [];
            const res = await getDepartmentsByOrg(id);
            return res.payload as IDepartment[];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:departments=[], isPending, refetch} = useQuery({
        queryKey: ['departmentsbyorg', id],
        queryFn: fetchDepartments,
    })

    return {departments, isPending, refetch}
}