import { Deleter, Editor, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";

export const OrganizationColumns = (
    handleInfo: (org:IOrganization)=>void,
    handleEdit: (org:IOrganization)=>void,
    handleDelete: (org:IOrganization)=>void,
):GridColDef[]=>{

    return [
        {
            field: 'logo',
            headerName: 'Logo',
            width:100,
            disableExport:true,
            filterable:false,
            renderCell: (params:GridRenderCellParams)=>(
                <div className="mt-1 relative flex-row h-full items-center pb-2 flex">
                    <Image alt="logo" height={30} width={30}  objectFit="cover"  className="rounded-full object-cover" src={params.row?.logo} />
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
            field: 'website',
            headerName: 'Website',
            width:170,
            renderCell: (params:GridRenderCellParams)=>{
                const website = params.row?.website;
                    const normalizedUrl = website?.startsWith("http")
                    ? website
                    : `https://${website}`;
                return(
                    <Link target="_blank" href={`${normalizedUrl}`}  className="link">{params.row?.website}</Link>
                )
            }
        },

        {
            field: 'phone',
            headerName: 'Phone',
            width:100,
        },
        {
            field: 'address',
            headerName: 'Address',
            width:120,
        },
        {
            field: 'appName',
            headerName: 'App Name',
            width:120,
        },
        {
            field: 'description',
            headerName: 'Description',
            width:120,
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
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="100" tip="View organization" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="100" tip="Edit organization" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="100" tip="Delete organization" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}