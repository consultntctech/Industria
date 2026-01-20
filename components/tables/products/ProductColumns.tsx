import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { ICategory } from "@/lib/models/category.model";
import { IOrganization } from "@/lib/models/org.model";
import { IProduct } from "@/lib/models/product.model";
import { ISupplier } from "@/lib/models/supplier.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const ProductColumns = (
    handleInfo: (user:IProduct)=>void,
    handleEdit: (user:IProduct)=>void,
    handleDelete: (user:IProduct)=>void,
):GridColDef[]=>{

    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:120,
        },

        {
            field: 'type',
            headerName: 'Product Type',
            width:110,
        },

        {
            field:'category',
            headerName: 'Category',
            width:170,
            valueFormatter: (_, row:IProduct)=>{
                const category = row?.category as ICategory;
                return category ? category.name : '';
            },
            valueGetter: (_, row:IProduct)=>{
                const category = row?.category as ICategory;
                return category ? category.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const category = params?.row?.category as ICategory;
                return (
                    <Linker link={`/dashboard/products/categories?Id=${category?._id}`} placeholder={category?.name} tableId="32" />
                )
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
                        <Linker link={`/dashboard/suppliers?Id=${item?._id}`} placeholder={item?.name} tableId="41" />
                        {index < suppliers.length - 1 && ', '}
                        </span>
                    ))}
                    </div>
                );
            }

        },

        {
            field: 'uom',
            headerName: 'Unit of Measure',
            width:110,
        },
        {
            field: 'threshold',
            headerName: 'Threshold',
            width:100,
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
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IProduct)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <Linker link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} tableId="38" />
                )
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
                    <Viewer tableId="28" tip="View product" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="28" tip="Edit product" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="28" tip="Delete product" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}