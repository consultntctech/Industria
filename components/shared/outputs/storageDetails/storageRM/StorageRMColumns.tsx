import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IBatch } from "@/lib/models/batch.model";
import { IProduct } from "@/lib/models/product.model";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { ISupplier } from "@/lib/models/supplier.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const StorageRMColumns = ():GridColDef[]=>{
    const {currency} = useCurrencyConfig();
    return [
       
        {
            field: 'materialName',
            headerName: 'Material Name',
            width:120,
            renderCell: (params:GridRenderCellParams)=>{
                const rmaterial = params?.row as IRMaterial;
                return (
                    <Linker link={`/dashboard/products/raw-materials?Id=${rmaterial?._id}`} placeholder={rmaterial?.materialName} tableId="87" />
                )
            }
        },

        {
            field:'product',
            headerName: 'Product',
            width:120,
            valueFormatter: (_, row:IRMaterial)=>{
                const product = row?.product as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IRMaterial)=>{
                const product = row?.product as IProduct;
                return product ? product.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const product = params?.row?.product as IProduct;
                return (
                    <Linker tableId="28" link={`/dashboard/products/types?Id=${product?._id}`} placeholder={product?.name} />
                )
            }
        },
        {
            field:'suppliers',
            headerName: 'Suppliers',
            width:120,
            valueFormatter: (_, row:IRMaterial)=>{
                const supplier = row?.suppliers as ISupplier[];
                return supplier ? supplier.map((item)=>item.name).join(', ') : '';
            },
            valueGetter: (_, row:IRMaterial)=>{
                const supplier = row?.suppliers as ISupplier[];
                return supplier ? supplier.map((item)=>item.name).join(', ') : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const suppliers = params?.row?.suppliers as ISupplier[];
                return (
                    <div className="flex flex-row items-center gap-1 flex-wrap" >
                    
                        {
                        suppliers.map((supplier, index)=>(
                            <span key={index} >
                                <Linker key={index} link={`/dashboard/suppliers?Id=${supplier?._id}`} placeholder={supplier?.name} tableId="41" />
                                {index < suppliers.length - 1 ? ', ' : ''}
                            </span>
                        ))
                            
                    }
                    </div>
                )
            }
        },
        {
            field:'batch',
            headerName: 'Batch',
            width:120,
            valueFormatter: (_, row:IRMaterial)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:IRMaterial)=>{
               const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const batch = params?.row?.batch as IBatch;
                return (
                    <Linker link={`/dashboard/products/batches?Id=${batch?._id}`} placeholder={batch?.code} tableId="55" />
                )
            }
        },
        
        {
            field: 'qStatus',
            headerName: 'Quality Status',
            width:100,
        },
        {
            field: 'qReceived',
            headerName: 'Quantity Received',
            width:110,
        },
        {
            field: 'qAccepted',
            headerName: 'Stock',
            width:100,
        },
        {
            field: 'qUsed',
            headerName: 'Quantity Used',
            width:100,
            valueFormatter:(_, row:IRMaterial)=>{
                const used = (row?.qReceived || 0) - (row?.qAccepted ||0) - (row?.qRejected||0);
                return used;
            },
            valueGetter:(_, row:IRMaterial)=>{
                const used = (row?.qReceived || 0) - (row?.qAccepted ||0) - (row?.qRejected||0);
                return used;
            }
        },
        {
            field: 'qRejected',
            headerName: 'Quantity Rejected',
            width:110,
        },
        {
            field: 'unitPrice',
            headerName: `Unit Price (${currency?.symbol || ''})`,
            width:110,
        },
        {
            field: 'weight',
            headerName: 'Weight',
            width:110,
            valueFormatter:(_, row:IRMaterial)=>{
                const product = row?.product as IProduct;
                return `${row?.weight || 0} ${product?.uom || 'units'}`
            },
            valueGetter:(_, row:IRMaterial)=>{
                const product = row?.product as IProduct;
                return `${row?.weight || 0} ${product?.uom || 'units'}`
            }
        },
        {
            field: 'charges',
            headerName: `Extra Charges (${currency?.symbol || ''})`,
            width:110,
        },
        {
            field: 'discount',
            headerName: `Discount (${currency?.symbol || ''})`,
            width:110,
        },
        {
            field: 'price',
            headerName: `Total Price (${currency?.symbol || ''})`,
            width:110,
        },
       
        
        {
            field: 'dateReceived',
            headerName: 'Date Received',
            width:110,
            valueFormatter:(_, row:IRMaterial)=>{
                return formatDate(row?.dateReceived)
            },
            valueGetter:(_, row:IRMaterial)=>{
                return formatDate(row?.dateReceived)
            }
        },
    ]
}