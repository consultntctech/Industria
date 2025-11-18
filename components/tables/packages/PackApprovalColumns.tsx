
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { IPackage } from "@/lib/models/package.model";
import { IPackApproval } from "@/lib/models/packapproval.model";
// import { IPackApproval } from "@/lib/models/prodapproval.model";
// import { IProduction } from "@/lib/models/production.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { IoSettingsOutline } from "react-icons/io5";

export const PackApprovalColumns = (
    handleEdit: (item:IPackApproval)=>void,
):GridColDef[]=>{
    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:160,
        },
        {
            field:'package',
            headerName: 'Package',
            width:170,
            valueFormatter: (_, row:IPackApproval)=>{
                const pack = row?.package as IPackage;
                return pack ? pack.name : '';
            },
            valueGetter: (_, row:IPackApproval)=>{
                const pack = row?.package as IPackage;
                return pack ? pack.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const pack = params?.row?.package as IPackage;
                return(
                    <Link href={`/dashboard/distribution/packaging/${pack?._id}`} className="link" >{pack?.name}</Link>
                )
            }
        },
        
        {
            field:'createdBy',
            headerName: 'Requester',
            width:170,
            valueFormatter: (_, row:IPackApproval)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IPackApproval)=>{
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
            field:'approver',
            headerName: 'Approver',
            width:170,
            valueFormatter: (_, row:IPackApproval)=>{
                const approver = row?.approver as IUser;
                return approver ? approver.name : '';
            },
            valueGetter: (_, row:IPackApproval)=>{
                const approver = row?.approver as IUser;
                return approver ? approver.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.approver as IUser;
                return (
                    <Link href={`/dashboard/users?Id=${creator?._id}`} className="link" >{creator?.name}</Link>
                )
            }
        },

        {
            field: 'status',
            headerName: 'Status',
            width:110,
            headerAlign: 'center',
            valueFormatter: (_, row:IPackApproval)=>{
                const status = row?.status as string;
                return status ? status : '';
            },
            valueGetter: (_, row:IPackApproval)=>{
                const status = row?.status as string;
                return status ? status : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const status = params?.row?.status as string;
                return (
                    <div className="h-full flex-center gap-3">
                      <span className={`${status === 'Pending' ? 'text-yellow-700' : status === 'Approved' ? 'text-green-700' : 'text-red-700'}`}>{status}</span>
                    </div>
                )
            }
        },
        

        {
            field: 'note',
            headerName: 'Review Note',
            width:150,
        },

        {
            field:'org',
            headerName: 'Organization',
            width:170,
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
                    <Link href={`/dashboard/organizations?Id=${org?._id}`} className="link" >{org?.name}</Link>
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
        headerAlign: 'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                <Tooltip title="Take action">
                    <IoSettingsOutline onClick={()=>handleEdit(params?.row)}  className="cursor-pointer text-blue-700" />
                </Tooltip>
                    
                </div>
            )
        },
    }
        
    ]
}