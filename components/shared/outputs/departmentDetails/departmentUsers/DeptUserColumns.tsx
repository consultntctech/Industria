import { Deleter,  Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { useCanUser } from "@/hooks/useAuth";
import { IEmployee } from "@/lib/models/employee.model";
// import { ISessionRole } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import { Activity } from "react";

export const DeptUserColumns = (
    handleInfo: (user:IEmployee)=>void,
    handleDelete: (user:IEmployee)=>void,
    isHod: boolean,
):GridColDef[]=>{
    const editor = useCanUser('38', 'UPDATE');

    return [
        {
            field: 'photo',
            headerName: 'Photo',
            width:100,
            disableExport:true,
            filterable:false,
            renderCell: (params:GridRenderCellParams)=>(
                <div className="relative flex flex-row items-center h-full pb-2 mt-1">
                    <Image alt="member" height={30} width={30}  objectFit="cover"  className="object-cover rounded-full" src={params.row?.photo} />
                </div>
            )
        },
        {
            field: 'name',
            headerName: 'Name',
            width:170,
            valueGetter: (_, row:IEmployee)=>{
                return row?.name;
            },
            valueFormatter: (_, row:IEmployee)=>{
                return row?.name;
            },
            renderCell: (params:GridRenderCellParams)=>{
                const row = params?.row as IEmployee;
                return (
                    <Linker link={`/dashboard/users?Id=${row?._id}`} tableId="38" placeholder={row?.name} />
                )
            }
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
            const canSeeActions = isHod || editor;
            // console.log(params.row?.id)
            return(
                <div className="h-full gap-3 flex-center">
                    <Viewer tableId="96" onClick={()=>handleInfo(params?.row)} tip="View user" />
                    <Activity mode={canSeeActions ? 'visible' : 'hidden' } >
                        <Deleter tableId="96" onClick={()=>handleDelete(params?.row)} tip="Remove user from department" />
                    </Activity>
                </div>
            )
        },
    }
        
    ]
}