import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { ISupplier } from "@/lib/models/supplier.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";

export const SupplierColoumns = (
    handleInfo: (supplier:ISupplier)=>void,
    handleEdit: (supplier:ISupplier)=>void,
    handleDelete: (supplier:ISupplier)=>void,
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
            field: 'person',
            headerName: 'Person',
            width:150,
        },

        {
            field: 'isActive',
            headerName: 'Active',
            width:100,
            valueFormatter:(_, row:ISupplier)=>{
                return row?.isActive ? 'Yes' : 'No';
            },
            valueGetter:(_, row:ISupplier)=>{
                return row?.isActive ? 'Yes' : 'No';
            }
        },

        {
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:ISupplier)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:ISupplier)=>{
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
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:ISupplier)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:ISupplier)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:ISupplier)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:ISupplier)=>{
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
                    <Viewer tableId="41" tip="View supplier" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="41" tip="Edit supplier" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="41" tip="Delete supplier" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}