import { formatDate } from "@/functions/dates";
import { IRole } from "@/lib/models/role.model";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { GoInfo, GoPencil } from "react-icons/go";
import { IoTrashBinOutline } from "react-icons/io5";
import { TableData } from "@/Data/roles/table";
import { IOperation } from "@/types/Types";
import { PiRadioButtonBold } from "react-icons/pi";

export const RolesColumns = (
    handleInfo: (role:IRole)=>void,
    handleEdit: (role:IRole)=>void,
    handleAssign: (role:IRole)=>void,
    handleDelete: (role:IRole)=>void,
):GridColDef[]=>{

    return [

        {
            field: 'name',
            headerName: 'Name',
            width:170,
        },

        {
            field: 'table',
            headerName: 'Table',
            width:100,
            valueFormatter: (_, row:IRole)=>{
                const tableId = row?.permissions?.tableid;
                const table = TableData.find(t=>t.id===tableId)?.name;
                return table ? table : '';
            },
            valueGetter: (_, row:IRole)=>{
                const tableId = row?.permissions?.tableid;
                const table = TableData.find(t=>t.id===tableId)?.name;
                return table ? table : '';
            },
        },
        {
            field: 'permissions',
            headerName: 'Permissions',
            width:300,
            valueFormatter: (_, row:IRole)=>{
                const perms = row?.permissions?.operations;
                return perms ? perms.map(op=>op.name).join(', ') : '';
            },
            valueGetter: (_, row:IRole)=>{
                const perms = row?.permissions?.operations;
                return perms ? perms.map(op=>op.name).join(', ') : '';
            },
            renderCell:(params:GridRenderCellParams)=>{
                const perms = params?.row?.permissions?.operations as IOperation[];
                return (
                    <div className="flex flex-wrap gap-2 flex-row">
                        {perms?.map((op, index)=>(
                            <span key={index} >
                                <span  className="text-sm">{op.name}</span>
                                {index < perms.length - 1 && ', '}
                            </span>
                        ))}
                    </div>
                )
            }
        },

       {
           field: 'description',
           headerName: 'Description',
           width:150,
       },

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:IRole)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IRole)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const org = params?.row?.org as IOrganization;
                return (
                    <Link href={`/dashboard/organizations?Id=${org?._id}`} className="link" >{org?.name}</Link>
                )
            }
        },
                

        {
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IRole)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IRole)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <Link href={`/dashboard/users?Id=${creator?._id}`} className="link" >{creator?.name}</Link>
                )
            }
        },

        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IRole)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IRole)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IRole)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IRole)=>{
                return formatDate(row?.updatedAt)
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:130,
        disableExport: true,
        headerAlign: 'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Tooltip title="View role">
                        <GoInfo onClick={()=>handleInfo(params?.row)}  className="cursor-pointer text-green-700" />
                    </Tooltip>
                    <Tooltip title="Edit role">
                        <GoPencil onClick={()=>handleEdit(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    <Tooltip title="Assign role">
                        <PiRadioButtonBold onClick={()=>handleAssign(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    <Tooltip title="Delete role">
                        <IoTrashBinOutline onClick={()=>handleDelete(params?.row)}  className="cursor-pointer text-red-700" />
                    </Tooltip>
                </div>
            )
        },
    }
        
    ]
}