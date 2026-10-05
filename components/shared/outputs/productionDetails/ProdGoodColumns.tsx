import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { IBatch } from "@/lib/models/batch.model";
import { IGood, IGoodPopulate } from "@/lib/models/good.model";
import { IProduct } from "@/lib/models/product.model";
import { IProduction } from "@/lib/models/production.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const ProdGoodColumns = ():GridColDef[]=>{
     return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:120,
            valueFormatter: (_, row:IGoodPopulate) =>{
                const good = row?.materialId as IGood;
                return good?.name || '';
            },
            valueGetter: (_, row:IGoodPopulate) =>{
                const good = row?.materialId as IGood;
                return good?.name || '';
            },
            
            renderCell: (params:GridRenderCellParams)=>{
                const good = params?.row?.materialId as IGood;
                return (
                    <Linker tableId="88" link={`/dashboard/processing/goods?Id=${good?._id}`} placeholder={good?.name}  />
                )
            }
        },

        {
            field: 'serialName',
            headerName: 'Serial Name',
            width:110,
            valueFormatter: (_, row:IGoodPopulate) =>{
                const good = row?.materialId as IGood;
                return good?.serialName || '';
            },
            valueGetter: (_, row:IGoodPopulate) =>{
                const good = row?.materialId as IGood;
                return good?.serialName || '';
            },
        },
        {
            field:'batch',
            headerName: 'Batch',
            width:170,
            valueFormatter: (_, row:IGoodPopulate) =>{
                const good = row?.materialId as IGood;
                const batch = good?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:IGoodPopulate)=>{
                const good = row?.materialId as IGood;
                const batch = good?.batch as IBatch;
                return batch ? batch.code : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const good = params?.row?.materialId as IGood;
                const batch = good?.batch as IBatch;
                return (
                    <Linker tableId="55" link={`/dashboard/products/batches?Id=${batch?._id}`} placeholder={batch?.code}  />
                )
            }
        },

        {
            field:'production',
            headerName: 'Production',
            width:170,
            valueFormatter: (_, row:IGoodPopulate)=>{
                const good = row?.materialId as IGood;
                const production = good?.production as IProduction;
                return production ? production.name : '';
            },
            valueGetter: (_, row:IGoodPopulate)=>{
                const good = row?.materialId as IGood;
                const production = good?.production as IProduction;
                return production ? production.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const good = params?.row?.materialId as IGood;
                const production = good?.production as IProduction;
                return (
                    <Linker tableId="8" link={`/dashboard/processing/production/${production?._id}`} placeholder={production?.name}  />
                )
            }
        },
        {
            field:'product',
            headerName: 'Product',
            width:170,
            valueFormatter: (_, row:IGoodPopulate)=>{
                const good = row?.materialId as IGood;
                const product = good?.product as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IGoodPopulate)=>{
                const good = row?.materialId as IGood;
                const product = good?.product as IProduct;
                return product ? product.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const good = params?.row?.materialId as IGood;
                const product = good?.product as IProduct;
                return (
                    <Linker tableId="28" link={`/dashboard/products/types?Id=${product?._id}`} placeholder={product?.name}  />
                )
            }
        },
        {
            field:'quantity',
            headerName: 'Quantity',
            width:120,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'weight',
            headerName: 'Weight',
            width:100,
            headerAlign: 'center',
            align: 'center',
            valueFormatter: (_, row:IGoodPopulate)=>{
                const good = row?.materialId as IGood;
                const product = good?.product as IProduct;
                return `${row?.weight || 0} ${product?.uom || 'units'}`
            },
            valueGetter: (_, row:IGoodPopulate)=>{
                const good = row?.materialId as IGood;
                const product = good?.product as IProduct;
                return `${row?.weight || 0} ${product?.uom || 'units'}`
            },
        },
       

        
    ]
}