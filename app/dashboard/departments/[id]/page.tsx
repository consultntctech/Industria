import SingleDepartment from "@/components/Screens/SingleDepartment";
import { getDepartment } from "@/lib/actions/department.action";
import { IDepartment } from "@/lib/models/department.model";

type PageProps = {
    params: Promise<{id:string}>
}

export default async function Page({params}:PageProps) {
    const {id} = await params;
    const res = await getDepartment(id);
    const department = res.payload as unknown as IDepartment;
    return <SingleDepartment department={department} />
}