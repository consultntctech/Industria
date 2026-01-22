import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { isGlobalAdmin } from "@/Data/roles/permissions";
import { formatDate } from "@/functions/dates";
import { useAuth } from "@/hooks/useAuth";
import { IOrganization } from "@/lib/models/org.model";
import { IRole } from "@/lib/models/role.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import { Activity } from "react";

export const UserColoumns = (
    handleInfo: (user:IUser)=>void,
    handleEdit: (user:IUser)=>void,
    handleDelete: (user:IUser)=>void,
):GridColDef[]=>{
    const {user} = useAuth();
    const isGlobal = isGlobalAdmin(user?.roles as IRole[]);

    return [
        {
            field: 'photo',
            headerName: 'Photo',
            width:100,
            disableExport:true,
            filterable:false,
            renderCell: (params:GridRenderCellParams)=>(
                <div className="mt-1 relative flex-row h-full items-center pb-2 flex">
                    <Image alt="member" height={30} width={30}  objectFit="cover"  className="rounded-full object-cover" src={params.row?.photo} />
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
            field:'org',
            headerName: 'Organization',
            width:140,
            valueFormatter: (_, row:IUser)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IUser)=>{
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
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IUser)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IUser)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IUser)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IUser)=>{
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
            const row = params?.row as IUser;
            const isG = isGlobalAdmin(row?.roles as IRole[]);
            const canSeeActions = !isG || isGlobal;
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="38" onClick={()=>handleInfo(params?.row)} tip="View user" />
                    <Activity mode={canSeeActions ? 'visible' : 'hidden' } >
                        <Editor tableId="38" onClick={()=>handleEdit(params?.row)} tip="Edit user" />
                        <Deleter tableId="38" onClick={()=>handleDelete(params?.row)} tip="Delete user" />
                    </Activity>
                </div>
            )
        },
    }
        
    ]
}