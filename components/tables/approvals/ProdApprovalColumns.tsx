
import { Approver, Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { IProdApproval } from "@/lib/models/prodapproval.model";
import { IProduction } from "@/lib/models/production.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";

export const ProdApprovalColumns = (
    handleEdit: (user:IProdApproval)=>void,
):GridColDef[]=>{
    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:160,
        },
        {
            field:'production',
            headerName: 'Production',
            width:170,
            valueFormatter: (_, row:IProdApproval)=>{
                const production = row?.production as IProduction;
                return production ? production.name : '';
            },
            valueGetter: (_, row:IProdApproval)=>{
                const production = row?.production as IProduction;
                return production ? production.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const production = params?.row?.production as IProduction;
                return (
                    <Link href={`/dashboard/processing/production/${production?._id}`} className="link" >{production?.name}</Link>
                )
            }
        },
        
        {
            field:'createdBy',
            headerName: 'Requester',
            width:170,
            valueFormatter: (_, row:IProdApproval)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IProdApproval)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <Linker tableId="38" link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} />
                )
            }
        },
        {
            field:'approver',
            headerName: 'Approver',
            width:170,
            valueFormatter: (_, row:IProdApproval)=>{
                const approver = row?.approver as IUser;
                return approver ? approver.name : '';
            },
            valueGetter: (_, row:IProdApproval)=>{
                const approver = row?.approver as IUser;
                return approver ? approver.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.approver as IUser;
                return (
                    <Linker tableId="38" link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} />
                )
            }
        },

        {
            field: 'status',
            headerName: 'Status',
            width:110,
            headerAlign: 'center',
            valueFormatter: (_, row:IProdApproval)=>{
                const status = row?.status as string;
                return status ? status : '';
            },
            valueGetter: (_, row:IProdApproval)=>{
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
                    <Linker tableId="100" link={`/dashboard/organizations?Id=${org?._id}`} placeholder={org?.name} />
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
                    <Approver tip="Take Action" tableId="8" onClick={()=>handleEdit(params?.row)} />    
                </div>
            )
        },
    }
        
    ]
}