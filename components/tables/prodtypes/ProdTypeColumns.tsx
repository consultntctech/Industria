import { Deleter, Editor, Linker, ViewCreator, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { IProdType } from "@/lib/models/prodtype.model";
import { IProduct } from "@/lib/models/product.model";
import { ISupplier } from "@/lib/models/supplier.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";


export const ProdTypeColumns = (
    handleInfo: (item:IProdType)=>void,
    handleEdit: (item:IProdType)=>void,
    handleDelete: (item:IProdType)=>void,
):GridColDef[]=>{
    return [
        {
            field: 'name',
            headerName: 'Name',
            width:120,
        },
        {
            field: 'code',
            headerName: 'Item code',
            width:110,
        },
        {
            field:'category',
            headerName: 'Category',
            width:100
        },
        {
            field:'subcategory',
            headerName: 'Subcategory',
            width:100
        },

        {
            field: 'stock',
            headerName: 'Quantity',
            width:110,
            headerAlign: 'center',
        },
        {
            field: 'available',
            headerName: 'Stock',
            width:80,
            headerAlign: 'center',
        },
        {
            field: 'used',
            headerName: 'Used',
            width:80,
        },
        {
            field: 'threshold',
            headerName: 'Reorder level',
            width:80,
            headerAlign: 'center',
        },

        {
            field: 'uom',
            headerName: 'Unit of measure',
            width:100,
            headerAlign:'center'
        },
        
        {
            field: 'reusable',
            headerName: 'Reusable',
            width:100,
            headerAlign:'center',
            valueFormatter:(_, row:IProdType)=>{
                const reusable = row?.reusable as boolean;
                return reusable ? 'Yes' : 'No';
            },
            valueGetter:(_, row:IProdType)=>{
                const reusable = row?.reusable as boolean;
                return reusable ? 'Yes' : 'No';
            }
        },

        {
            field:'suppliers',
            headerName: 'Suppliers',
            width:200,
            valueFormatter: (_, row:IProduct)=>{
                const suppliers = row?.suppliers as ISupplier[];
                const supplierNames = suppliers.map(supplier=>supplier.name)?.join(', ');
                return supplierNames ? supplierNames : '';
            },
            valueGetter: (_, row:IProduct)=>{
                const suppliers = row?.suppliers as ISupplier[];
                const supplierNames = suppliers.map(supplier=>supplier.name)?.join(', ');
                return supplierNames ? supplierNames : '';
            },
            renderCell: (params: GridRenderCellParams) => {
                const suppliers = params.row?.suppliers as ISupplier[];
                return (
                    <div className="flex flex-row items-center gap-1 flex-wrap">
                    {suppliers?.map((item, index) => (
                        <span key={item?._id}>
                            <Linker placeholder={item?.name} link={`/dashboard/suppliers/${item?._id}`} tableId="41" />
                            {index < suppliers.length - 1 && ', '}
                        </span>
                    ))}
                    </div>
                );
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
                    <Linker link={`/dashboard/organizations?Id=${org?._id}`} placeholder={org?.name} tableId="100" />
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
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IProduct)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : row?.creator || '';
            },
            valueGetter: (_, row:IProduct)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : row?.creator || '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <ViewCreator creator={creator} creatorName={params?.row?.creator} />
                )
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:120,
        disableExport: true,
        headerAlign:'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="17" tip="View type" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="17" tip="Edit type" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="17" tip="Delete type" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}