import { ICategory } from "@/lib/models/category.model";
import {  IProductWithStock } from "@/lib/models/product.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
export const ProductMiniColumns = (
    
):GridColDef[]=>{

    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:130,
        },

        {
            field: 'type',
            headerName: 'Product Type',
            width:120,
        },

        {
            field:'category',
            headerName: 'Category',
            width:170,
            valueFormatter: (_, row:IProductWithStock)=>{
                const category = row?.category as ICategory;
                return category ? category.name : '';
            },
            valueGetter: (_, row:IProductWithStock)=>{
                const category = row?.category as ICategory;
                return category ? category.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const category = params?.row?.category as ICategory;
                return (
                    <Link href={`/dashboard/products/categories?Id=${category?._id}`} className="link" >{category?.name}</Link>
                )
            }
        },
        
        {
            field: 'outOfStock',
            headerName: 'Out of Stock',
            width:110,
            valueFormatter:(_, row:IProductWithStock)=>{
                return row?.outOfStock ? 'Yes' : 'No';
            },
            valueGetter:(_, row:IProductWithStock)=>{
                return row?.outOfStock ? 'Yes' : 'No';
            },
        },
            
        {
            field: 'stock',
            headerName: 'Current Stock',
            width:120,
        },
        {
            field: 'threshold',
            headerName: 'Threshold',
            width:110,
        },
        {
            field: 'uom',
            headerName: 'Unit of Measure',
            width:120,
        },
        

    ]
}