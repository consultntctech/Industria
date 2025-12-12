import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { GoInfo, GoPencil } from "react-icons/go";
import { IoTrashBinOutline } from "react-icons/io5";
import { PiRadioButtonBold } from "react-icons/pi";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
import { IRole } from "@/lib/models/role.model";

export const RoletemplateColumns = (
    handleInfo: (role:IRoleTemplate)=>void,
    handleEdit: (role:IRoleTemplate)=>void,
    handleAssign: (role:IRoleTemplate)=>void,
    handleDelete: (role:IRoleTemplate)=>void,
):GridColDef[]=>{

    return [

        {
            field: 'name',
            headerName: 'Name',
            width:170,
        },

        
        {
            field: 'roles',
            headerName: 'Roles',
            width:300,
            valueFormatter: (_, row:IRoleTemplate)=>{
                const roles = row?.roles as IRole[];
                return roles ? roles.map(op=>op.name).join(', ') : '';
            },
            valueGetter: (_, row:IRoleTemplate)=>{
                const roles = row?.roles as IRole[];
                return roles ? roles.map(op=>op.name).join(', ') : '';
            },
            renderCell:(params:GridRenderCellParams)=>{
                const roles = params?.row?.roles as IRole[];
                return (
                    <div className="flex flex-wrap gap-2 flex-row">
                        {roles?.map((op, index)=>(
                            <span key={index} >
                                <Link  className="link" href={`/dashboard/users/roles?Id=${op._id}`}>{op.name}</Link>
                                {index < roles.length - 1 && ', '}
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
            valueFormatter: (_, row:IRoleTemplate)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IRoleTemplate)=>{
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
            valueFormatter: (_, row:IRoleTemplate)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IRoleTemplate)=>{
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
            valueFormatter:(_, row:IRoleTemplate)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IRoleTemplate)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IRoleTemplate)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IRoleTemplate)=>{
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
                    <Tooltip title="View template">
                        <GoInfo onClick={()=>handleInfo(params?.row)}  className="cursor-pointer text-green-700" />
                    </Tooltip>
                    <Tooltip title="Edit template">
                        <GoPencil onClick={()=>handleEdit(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    <Tooltip title="Assign template">
                        <PiRadioButtonBold onClick={()=>handleAssign(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    <Tooltip title="Delete template">
                        <IoTrashBinOutline onClick={()=>handleDelete(params?.row)}  className="cursor-pointer text-red-700" />
                    </Tooltip>
                </div>
            )
        },
    }
        
    ]
}