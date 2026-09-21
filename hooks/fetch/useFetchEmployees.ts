import { IEmployee } from "@/lib/models/employee.model";
import { useAuth } from "../useAuth";
import { employeeHasAccount, getEmployeeByOrg, getEmployeesByDepartment } from "@/lib/actions/employee.action";
import { useQuery } from "@tanstack/react-query";

export const useFetchEmployees = (showMe:boolean = false)=>{
 const {user} = useAuth();
 
 const fetchEmployees = async ():Promise<IEmployee[]> => {
     try {
         if(!user) return [];
         const res = await getEmployeeByOrg(user?.org as string);
         const payload = res.payload as IEmployee[];
         return payload
         .filter((emp)=> showMe ? emp : emp.email !== user?.email)
         .sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
         
     } catch (error) {
         console.log(error);
         return [];
     }
 }

 const {data:employees=[], isPending, refetch, isSuccess} = useQuery({
     queryKey: ['employees', user?.org, showMe],
     queryFn: fetchEmployees,
     enabled: !!user
 });
 return {employees, isPending, refetch, isSuccess}
}


export const useEmployeeHasAccount = (email:string)=>{
    const checkEmployee = async ():Promise<boolean> => {
        try {
            if(!email) return true;
            const res = await employeeHasAccount(email);
            const payload = res.payload as IEmployee;
            return !!payload;
        } catch (error) {
            console.log(error);
            return true;
        }
    }

    const {data:hasAccount=true, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['employee', email],
        queryFn: checkEmployee,
        enabled: !!email
    });
    return {hasAccount, isPending, refetch, isSuccess}
};

export const useFetchDepartmentEmployees = (departmentId:string, showMe:boolean=true) => {
    const {user} = useAuth();
    const fetchDepartmentEmployees = async ():Promise<IEmployee[]>=>{
        try {
            if(!user) return [];
            const res = await getEmployeesByDepartment(departmentId);
            const payload = res.payload as IEmployee[];
            return payload
            .filter((emp)=> showMe ? emp : emp.email !== user?.email)
            .sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:employees=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['departmentEmployees', departmentId],
        queryFn: fetchDepartmentEmployees,
        enabled: !!user && !!departmentId
    })

    return {employees, isPending, refetch, isSuccess}
}