import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IOrganization } from "@/lib/models/org.model";
import { IProdItem } from "@/lib/models/proditem.model";
import { IProduct } from "@/lib/models/product.model";
import { ISupplier } from "@/lib/models/supplier.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";


export const ProdItemColumns = (
    handleInfo: (user:IProdItem)=>void,
    handleEdit: (user:IProdItem)=>void,
    handleDelete: (user:IProdItem)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();
    return [
       
        {
            field: 'materialName',
            headerName: 'Serial Name',
            width:120,
        },
        {
            field: 'name',
            headerName: 'Name',
            width:120,
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
            field: 'quantity',
            headerName: 'Quantity received',
            width:110,
            headerAlign: 'center',
        },
        {
            field: 'stock',
            headerName: 'Stock',
            width:80,
            headerAlign: 'center',
        },
        {
            field: 'used',
            headerName: 'Used',
            width:80,
            headerAlign: 'center',
            valueFormatter: (_, row:IProdItem)=>{
                const used = (row?.used || 0) > row?.quantity ? row?.quantity : row?.used;
                return used;
            },
            valueGetter: (_, row:IProdItem)=>{
                const used = (row?.used || 0) > row?.quantity ? row?.quantity : row?.used;
                return used;
            }
        },
        {
            field: 'threshold',
            headerName: 'Threshold',
            width:80,
            headerAlign: 'center',
        },

        {
            field: 'unitPrice',
            headerName: currency ? `Unit price (${currency.symbol})` : 'Unit price',
            width:100,
            headerAlign:'center'
        },
        {
            field: 'price',
            headerName: currency ? `Total Price (${currency.symbol})` : 'Total Price',
            width:100,
            headerAlign:'center'
        },
        {
            field: 'uom',
            headerName: 'Unit of measure',
            width:100,
            headerAlign:'center'
        },
        {
            field: 'qStatus',
            headerName: 'Quality status',
            width:100,
            headerAlign:'center'
        },
        {
            field: 'reusable',
            headerName: 'Reusable',
            width:100,
            headerAlign:'center',
            valueFormatter:(_, row:IProdItem)=>{
                const reusable = row?.reusable as boolean;
                return reusable ? 'Yes' : 'No';
            },
            valueGetter:(_, row:IProdItem)=>{
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
                            <Linker placeholder={item?.name} link={`/dashboard/suppliers?Id=${item?._id}`} tableId="41" />
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
                    <Viewer tableId="12" tip="View item" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="12" tip="Edit item" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="12" tip="Delete item" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}