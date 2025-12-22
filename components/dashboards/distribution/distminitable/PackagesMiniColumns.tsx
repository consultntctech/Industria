
import { formatDate } from "@/functions/dates";
import { IPackage } from "@/lib/models/package.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";


export const PackagesMiniColumns = (
):GridColDef[]=>{
    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:160,
            valueFormatter: (_, item:IPackage)=> item.name || '',
            valueGetter: (_, item:IPackage)=> item.name || '',
            renderCell: (param:GridRenderCellParams)=>{
                const pack = param.row;
                return(
                    <Link className="link" href={`/dashboard/distribution/packaging/${pack?._id}`} >{pack?.name}</Link>
                )
            }
        },
        
        {
            field:'packagingType',
            headerName: 'Type',
            width:100
        }, 
       
        {
            field: 'quantity',
            headerName: 'Quantity',
            width:100,
        },

        {
            field: 'createdAt',
            headerName: 'Date',
            width:120,
            valueFormatter:(_, row:IUser)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IUser)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'approvalStatus',
            headerName: 'Approval Status',
            width:120,
            headerAlign: 'center',
            valueFormatter: (_, row:IPackage)=>{
                const status = row?.approvalStatus as string;
                return status ? status : '';
            },
            valueGetter: (_, row:IPackage)=>{
                const status = row?.approvalStatus as string;
                return status ? status : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const status = params?.row?.approvalStatus as string;
                return (
                    <div className="h-full flex-center gap-3">
                      <span className={`${status === 'Pending' ? 'text-yellow-700' : status === 'Approved' ? 'text-green-700' : 'text-red-700'}`}>{status}</span>
                    </div>
                )
            }
        },
        
    ]
}