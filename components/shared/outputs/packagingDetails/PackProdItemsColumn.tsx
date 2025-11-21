import { IProdItemPopulate } from "@/lib/models/package.model";
import { IProdItem } from "@/lib/models/proditem.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";

export const PackProdItemsColumn = (
):GridColDef[]=>{

    return [
       

        {
            field:'materialName',
            headerName: 'Serial Name',
            width:120,
            valueFormatter: (_, row:IProdItemPopulate)=>{
                const material = row?.materialId as IProdItem;
                return material ? material.materialName : '';
            },
            
            valueGetter: (_, row:IProdItemPopulate)=>{
                const material = row?.materialId as IProdItem;
                return material ? material.materialName : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const product = params?.row?.materialId as IProdItem;
                return (
                    <Link href={`/dashboard/distribution/packaging-materials?Id=${product?._id}`} className="link" >{product?.materialName}</Link>
                )
            }
        },
        
       
        {
            field: 'name',
            headerName: 'Item Name',
            width:100,
            valueFormatter: (_, row:IProdItemPopulate)=>{
                const material = row?.materialId as IProdItem;
                return material ? material.name : '';
            },
            valueGetter: (_, row:IProdItemPopulate)=>{
                const material = row?.materialId as IProdItem;
                return material ? material.name : '';
            },
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            width:100,
        },
        
    ]
}