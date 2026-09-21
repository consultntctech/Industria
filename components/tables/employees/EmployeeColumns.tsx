import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IDepartment } from "@/lib/models/department.model";
import { IEmployee } from "@/lib/models/employee.model";
import { IOrganization } from "@/lib/models/org.model";
// import { ISessionRole } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";

export const EmployeeColoumns = (
    handleInfo: (user:IEmployee)=>void,
    handleEdit: (user:IEmployee)=>void,
    handleDelete: (user:IEmployee)=>void,
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

        {
            field:'org',
            headerName: 'Organization',
            width:140,
            valueFormatter: (_, row:IEmployee)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IEmployee)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const org = params?.row?.org as IOrganization;
                return (
                    <Linker link={`/dashboard/organizations?Id=${org?._id}`} tableId="100" placeholder={org?.name} />
                )
            }
        },

        {
            field:'creator',
            headerName: 'Created By',
            width:120,
        },

        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IEmployee)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IEmployee)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IEmployee)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IEmployee)=>{
                return formatDate(row?.updatedAt)
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:120,
        disableExport: true,
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {

            // console.log(params.row?.id)
            return(
                <div className="h-full gap-3 flex-center">
                    <Viewer tableId="96" onClick={()=>handleInfo(params?.row)} tip="View employee" />
                    <Editor tableId="96" onClick={()=>handleEdit(params?.row)} tip="Edit employee" />
                    <Deleter tableId="96" onClick={()=>handleDelete(params?.row)} tip="Delete employee" />
                </div>
            )
        },
    }
        
    ]
}