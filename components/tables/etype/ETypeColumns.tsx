import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { IEType } from "@/lib/models/etype.model";
// import { ISessionRole } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { IUser } from "@/lib/models/user.model";
import { IECategory } from "@/lib/models/ecategory.model";

export const ETypeColumns = (
    handleInfo: (type:IEType)=>void,
    handleEdit: (type:IEType)=>void,
    handleDelete: (type:IEType)=>void,
):GridColDef[]=>{

    return [
        
        {
            field: 'name',
            headerName: 'Name',
            width:170,
        },
        {
            field: 'category',
            headerName: 'Category',
            width:170,
            valueFormatter: (_, row:IEType)=>{
                const category = row?.category as IECategory;
                return category ? category.name : '';
            },
            valueGetter: (_, row:IEType)=>{
                const category = row?.category as IECategory;
                return category ? category.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const category = params?.row?.category as IECategory;
                return (
                    <Linker link={`/dashboard/equipment/categories?Id=${category?._id}`} tableId="93" placeholder={category?.name} />
                )
            }
        },

        {
            field: 'qTotal',
            headerName: 'Quantity',
            width:100,
        },
        {
            field: 'qAvailable',
            headerName: 'Available',
            width:100,
        },
        {
            field: 'qInUse',
            headerName: 'In Use',
            width:100,
        },
        {
            field: 'qMaintenance',
            headerName: 'Maintenance',
            width:100,
        },
        {
            field: 'description',
            headerName: 'Note',
            width:250,
        },

        {
            field:'org',
            headerName: 'Organization',
            width:140,
            valueFormatter: (_, row:IEType)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IEType)=>{
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
            valueFormatter: (_, row:IEType)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            valueGetter: (_, row:IEType)=>{
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
            valueFormatter:(_, row:IEType)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IEType)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IEType)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IEType)=>{
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
                    <Viewer tableId="93" tip="View category" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="93" tip="Edit category" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="93" tip="Delete category" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}