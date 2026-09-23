import { Editor, Linker, ViewCreator, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IBatch } from "@/lib/models/batch.model";
import { ICustomer } from "@/lib/models/customer.model";
import { IGood } from "@/lib/models/good.model";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IOrganization } from "@/lib/models/org.model";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { IPackage } from "@/lib/models/package.model";
import { IProduct } from "@/lib/models/product.model";
import { IUser } from "@/lib/models/user.model";
import { IOriginalPrice } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";

export const LineItemsColumns = (
    handleInfo: (item:ILineItem)=>void,
    handleEdit: (item:ILineItem)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();

    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:120,
        },

        {
            field: 'serialNumber',
            headerName: 'Serial Number',
            width:110,
            valueFormatter: (_, row:ILineItem)=>{
                return row?.serialNumber || 'Not set';
            },
            valueGetter: (_, row:ILineItem)=>{
                return row?.serialNumber || 'Not set';
            },
        },
        {
            field:'batch',
            headerName: 'Batch',
            width:170,
            valueFormatter: (_, row:ILineItem)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:ILineItem)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const batch = params?.row?.batch as IBatch;
                return (
                    <Link href={`/dashboard/products/batches?Id=${batch?._id}`} className="link" >{batch?.code}</Link>
                )
            }
        },

        {
            field:'product',
            headerName: 'Product',
            width:170,
            valueFormatter: (_, row:ILineItem)=>{
                const product = row?.product as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:ILineItem)=>{
                const product = row?.product as IProduct;
                return product ? product.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const product = params.row?.product as IProduct;
                return (
                    <Link href={`/dashboard/products/types?Id=${product?._id}`} className="link" >{product?.name}</Link>
                )
            }
        },

        {
            field:'good',
            headerName: 'Finished Good',
            width:170,
            valueFormatter: (_, row:ILineItem)=>{
                const good = row?.good as IGood;
                return good ? good.name : '';
            },
            valueGetter: (_, row:ILineItem)=>{
                const good = row?.good as IGood;
                return good ? good.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const good = params.row?.good as IGood;
                return (
                    <Linker tableId="88" link={`/dashboard/processing/goods?Id=${good?._id}`} placeholder={good?.name} />
                )
            }
        },
        
        {
            field:'price',
            headerName: `Price ${currency ? `(${currency?.symbol})`:'' } `,
            width:100,
        },
        {
            field:'original',
            headerName: 'Original Price',
            width:100,
            valueFormatter: (_, row:ILineItem)=>{
                const original = row?.original as IOriginalPrice;
                const cy = original?.currency as IOtherCurrency;
                return original ? `${cy?.symbol || cy?.name || ''} ${original?.amount}` : 0;
            },
            valueGetter: (_, row:ILineItem)=>{
                const original = row?.original as IOriginalPrice;
                const cy = original?.currency as IOtherCurrency;
                return original ? `${cy?.symbol || cy?.name || ''} ${original?.amount}` : 0;
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width:100,
        },
        {
            field:'soldTo',
            headerName: 'Sold To',
            width:170,
            valueFormatter: (_, row:ILineItem)=>{
                const customer = row?.soldTo as ICustomer;
                return customer ? customer.name : '';
            },
            valueGetter: (_, row:ILineItem)=>{
                const customer = row?.soldTo as ICustomer;
                return customer ? customer.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const customer = params?.row?.soldTo as ICustomer;
                return (
                    <Linker tableId="33" link={`/dashboard/distribution/customers?Id=${customer?._id}`} placeholder={customer?.name} />
                )
            }
        },
        {
            field:'package',
            headerName: 'Package',
            width:170,
            valueFormatter: (_, row:ILineItem)=>{
                const pack = row?.package as IPackage;
                return pack ? pack.name : '';
            },
            valueGetter: (_, row:ILineItem)=>{
                const pack = row?.package as IPackage;
                return pack ? pack.name : '';
            },
           
            renderCell: (params:GridRenderCellParams)=>{
                const pack = params?.row?.pack as IPackage;
                return (
                    <Linker tableId="99" link={`/dashboard/distribution/packaging/${pack?._id}`} placeholder={pack?.name} />
                )
            }
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
                    <Linker tableId="100" link={`/dashboard/organizations?Id=${org?._id}`} placeholder={org?.name} />
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
            valueFormatter: (_, row:ILineItem)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : row?.creator || '';
            },
            valueGetter: (_, row:ILineItem)=>{
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
        headerAlign: 'center',
        disableExport: true,
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="44" onClick={()=>handleInfo(params?.row)} tip="View item" />
                    <Editor tableId="44" onClick={()=>handleEdit(params?.row)} tip="Edit item" />
                </div>
            )
        },
    }
        
    ]
}