import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { ILabourer } from "@/lib/models/labourer.model";
// import { ISessionRole } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { IUser } from "@/lib/models/user.model";

export const LabourerColoumns = (
    handleInfo: (labourer:ILabourer)=>void,
    handleEdit: (labourer:ILabourer)=>void,
    handleDelete: (labourer:ILabourer)=>void,
):GridColDef[]=>{

    return [
        
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
            field: 'note',
            headerName: 'Note',
            width:250,
        },

        {
            field:'org',
            headerName: 'Organization',
            width:140,
            valueFormatter: (_, row:ILabourer)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:ILabourer)=>{
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
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:ILabourer)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            valueGetter: (_, row:ILabourer)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <>
                    {
                        creator?
                        <Link href={`/dashboard/users?Id=${creator?._id}`} className="link" >{creator?.name}</Link>
                        :
                        <span className="">{params?.row?.creator}</span>
                    }
                    </>
                )
            }
        },

        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:ILabourer)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:ILabourer)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:ILabourer)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:ILabourer)=>{
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
                    <Viewer tableId="91" tip="View labourer" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="91" tip="Edit labourer" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="91" tip="Delete labourer" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}