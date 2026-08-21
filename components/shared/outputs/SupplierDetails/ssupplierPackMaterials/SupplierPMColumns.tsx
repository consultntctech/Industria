import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IProdItem } from "@/lib/models/proditem.model";
import { IProduct } from "@/lib/models/product.model";
import { ISupplier } from "@/lib/models/supplier.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const SupplierPMColumns = ():GridColDef[]=>{
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
            renderCell: (params:GridRenderCellParams)=>{
                const proditem = params?.row as IProdItem;
                return (
                    <Linker tableId="12" link={`/dashboard/distribution/packaging-materials?Id=${proditem?._id}`} linkStyle="mtext link" spanStyle='mtext' placeholder={proditem?.name} />
                )
            }
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
            headerName: 'Stock',
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

    ]

}