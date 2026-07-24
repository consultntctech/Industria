import { Deleter, Editor, Fulfiller, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import {  formatDate } from "@/functions/dates";
import { isDeadlinePast } from "@/functions/helpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ICustomer } from "@/lib/models/customer.model";
import { IOrder } from "@/lib/models/order.model";
import { IOrganization } from "@/lib/models/org.model";
// import { IProduct } from "@/lib/models/product.model";
import { IUser } from "@/lib/models/user.model";
import { OrderSelectType } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const OrdersColumns = (
    handleInfo: (item:IOrder)=>void,
    handleEdit: (item:IOrder)=>void,
    handleFulfill: (item:IOrder)=>void,
    handleDelete: (item:IOrder)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();

    return [

        
        {
            field: 'customer',
            headerName: 'Customer',
            width:170,
            valueFormatter: (_, row:IOrder)=>{
                const customer = row?.customer as ICustomer;
                return customer ? customer.name : '';
            },
            valueGetter: (_, row:IOrder)=>{
                const customer = row?.customer as ICustomer;
                return customer ? customer.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const customer = params?.row?.customer as ICustomer;
                return (
                    <Linker link={`/dashboard/distribution/customers?Id=${customer?._id}`} placeholder={customer?.name} tableId="33" />
                )
            }
        },
        {
            field: 'products',
            headerName: 'Products',
            width:170,
            valueFormatter: (_, row:IOrder)=>{
                const products = row?.products as OrderSelectType[];
                return products?.map(item => `${item.quantity} x ${item.product.name}`).join(', ');
            },
            valueGetter: (_, row:IOrder)=>{
                const products = row?.products as OrderSelectType[];
                return products?.map(item => `${item.quantity} x ${item.product.name}`).join(', ');
            },
            renderCell: (params:GridRenderCellParams)=>{
                const products = params?.row?.products as OrderSelectType[];
                return (
                    <>
                    {
                        products?.map((item, index)=>(
                            <Linker link={`/dashboard/products/types?Id=${item?.product?._id}`} tableId="28" placeholder={`${item?.quantity} x ${item?.product?.name}${index < products.length - 1 && ', '}`} key={index} />
                        ))
                    }
                    </>
                )
            }
        },


        {
            field: 'price',
            headerName: `Price ${currency?.symbol || ''}`,
            width:100,
        },
        {
            field: 'quantity',
            headerName: `Quantity`,
            width:100,
            valueFormatter: (_, row:IOrder)=>{
                const products = row?.products as OrderSelectType[];
                const quantity = products?.map(item => item.quantity).reduce((acc, curr) => acc + curr, 0);
                return quantity;
            },
            valueGetter: (_, row:IOrder)=>{
                const products = row?.products as OrderSelectType[];
                const quantity = products?.map(item => item.quantity).reduce((acc, curr) => acc + curr, 0);
                return quantity;
            }
        },
        

       
        {
            field: 'deadline',
            headerName: `Deadline`,
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                return formatDate(row?.deadline) || '';
            },
            valueGetter:(_, row:IOrder)=>{
                return formatDate(row?.deadline) || '';
            }
        },
        {
            field: 'status',
            headerName: `Status`,
            width:100,
        },
        {
            field: 'instruction',
            headerName: `Instructions`,
            width:150,
        },
        {
            field: 'description',
            headerName: `Description`,
            width:150,
        },

        {
            field:'late',
            headerName: 'Response time',
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                const islate = isDeadlinePast(row);
                return islate ? 'Late' : 'On time';
            },
            valueGetter:(_, row:IOrder)=>{
                const islate = isDeadlinePast(row);
                return islate ? 'Late' : 'On time';
            }
        },

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:IOrder)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IOrder)=>{
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
            field:'createdBy',
            headerName: 'Sales Personnel',
            width:170,
            valueFormatter: (_, row:IOrder)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            valueGetter: (_, row:IOrder)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <>
                    {
                        creator?
                        <Linker link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} tableId="38" />
                        :
                        <span className="">{params?.row?.creator}</span>
                    }
                    </>
                )
            }
        },
        {
            field: 'createdAt',
            headerName: 'Ordered On',
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IOrder)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IOrder)=>{
                return formatDate(row?.updatedAt)
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:150,
        disableExport: true,
        headerAlign:'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer onClick={()=>handleInfo(params?.row)} tableId="86" tip="View order" />
                    <Editor onClick={()=>handleEdit(params?.row)}  tableId="86" tip="Edit order" />
                   
                    {
                        params?.row?.status === 'Pending' &&
                        <Fulfiller onClick={()=>handleFulfill(params?.row)}  tableId="86" tip="Fulfill order" />
                    }
                    <Deleter onClick={()=>handleDelete(params?.row)}  tableId="86" tip="Delete order" />
                </div>
            )
        },
    }
        
    ]
}