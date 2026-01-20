import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { ICustomer } from "@/lib/models/customer.model";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";

export const CustomersColoumns = (
    handleInfo: (customer:ICustomer)=>void,
    handleEdit: (customer:ICustomer)=>void,
    handleDelete: (customer:ICustomer)=>void,
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
                <Linker target="_blank" tableId="33" link={`mailto:${params?.row?.email}`} placeholder={params.row?.email} />
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
            valueFormatter:(_, row:ICustomer)=>{
                return row?.isActive ? 'Yes' : 'No';
            },
            valueGetter:(_, row:ICustomer)=>{
                return row?.isActive ? 'Yes' : 'No';
            }
        },

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:ICustomer)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:ICustomer)=>{
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
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:ICustomer)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:ICustomer)=>{
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
            valueFormatter:(_, row:ICustomer)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:ICustomer)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:ICustomer)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:ICustomer)=>{
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
                    <Viewer tableId="33" tip="View customer" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="33" tip="Edit customer" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="33" tip="Delete customer" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}