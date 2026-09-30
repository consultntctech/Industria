import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { IDepartment } from "@/lib/models/department.model";
import { IEmployee } from "@/lib/models/employee.model";
// import { ISessionRole } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";

export const ProdEmployeeColumns = (

):GridColDef[]=>{


    return [
        {
            field: 'photo',
            headerName: 'Photo',
            width:100,
            disableExport:true,
            filterable:false,
            renderCell: (params:GridRenderCellParams)=>(
                <div className="relative flex flex-row items-center h-full pb-2 mt-1">
                    <Image alt="employee" height={30} width={30}  objectFit="cover"  className="object-cover rounded-full" src={params.row?.photo} />
                </div>
            )
        },
        {
            field: 'name',
            headerName: 'Name',
            width:170,
            renderCell: (params:GridRenderCellParams)=>(
                <Linker link={`/dashboard/employees?Id=${params?.row?._id}`} tableId="96" placeholder={params?.row?.name} />
            )
        },
        {
            field: 'email',
            headerName: 'Email',
            width:170,
            renderCell: (params:GridRenderCellParams)=>(
                <Link target="_blank" href={`mailto:${params?.row?.email}`}  className="link">{params.row?.email}</Link>
            )
        },

        {
            field: 'phone',
            headerName: 'Phone',
            width:100,
        },
        {
            field: 'address',
            headerName: 'Address',
            width:150,
        },

        {
            field: 'department',
            headerName: 'Department',
            width:140,
            valueFormatter: (_, row:IEmployee)=>{
                const department = row?.department as IDepartment;
                return department ? department.name : '';
            },
            valueGetter: (_, row:IEmployee)=>{
                const department = row?.department as IDepartment;
                return department ? department.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const department = params?.row?.department as IDepartment;
                return (
                    <Linker link={`/dashboard/departments/${department?._id}`} tableId="95" placeholder={department?.name} />
                )
            }
        },

        
    ]
}