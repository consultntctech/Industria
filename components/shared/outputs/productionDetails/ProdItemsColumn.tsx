import { IProdItem } from "@/lib/models/proditem.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";

export const ProdItemsColumn = (
):GridColDef[]=>{

    return [
       

        {
            field:'materialName',
            headerName: 'Serial Name',
            width:120,
            valueFormatter: (_, row:IProdItem)=>{
                return row ? row.materialName : '';
            },
            valueGetter: (_, row:IProdItem)=>{
                return row ? row.materialName : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const product = params?.row as IProdItem;
                return (
                    <Link href={`/dashboard/processing/production-materials?Id=${product?._id}`} className="link" >{product?.materialName}</Link>
                )
            }
        },
        
       
        {
            field: 'name',
            headerName: 'Item Name',
            width:100,
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            width:100,
        },
        
    ]
}