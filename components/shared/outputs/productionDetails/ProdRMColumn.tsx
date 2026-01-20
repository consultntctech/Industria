import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { IBatch } from "@/lib/models/batch.model";
import { IProduct } from "@/lib/models/product.model";
import { IRMaterial, IRMaterialPopulate } from "@/lib/models/rmaterial.mode";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const ProdRMColumns = (
):GridColDef[]=>{

    return [
       
        {
            field: 'materialName',
            headerName: 'Material Name',
            width:120,
            valueFormatter: (_, row:IRMaterialPopulate)=>{
                const material = row?.materialId as IRMaterial;
                return material ? material?.materialName : '';
            },
            valueGetter: (_, row:IRMaterialPopulate)=>{
                const material = row?.materialId as IRMaterial;
                return material ? material?.materialName : '';
            },
        },

        {
            field:'product',
            headerName: 'Product',
            width:120,
            valueFormatter: (_, row:IRMaterialPopulate)=>{
                const material = row?.materialId as IRMaterial;
                const product = material?.product as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IRMaterialPopulate)=>{
                const material = row?.materialId as IRMaterial;
                const product = material?.product as IProduct;
                return product ? product.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const material = params?.row?.materialId as IRMaterial;
                const product = material?.product as IProduct;
                return (
                    <Linker tableId="28" link={`/dashboard/products/types?Id=${product?._id}`} placeholder={product?.name} />
                )
            }
        },
        
        {
            field:'batch',
            headerName: 'Batch',
            width:120,
            valueFormatter: (_, row:IRMaterialPopulate)=>{
                const material = row?.materialId as IRMaterial;
                const batch = material?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:IRMaterialPopulate)=>{
               const material = row?.materialId as IRMaterial;
               const batch = material?.batch as IBatch;
               return batch ? batch.code : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const batch = params?.row?.materialId?.batch as IBatch;
                return (
                    <Linker tableId="55" link={`/dashboard/products/batches?Id=${batch?._id}`} placeholder={batch?.code} />
                )
            }
        },

        {
            field: 'quantity',
            headerName: 'Quantity',
            width:100,
        },
        
    ]
}