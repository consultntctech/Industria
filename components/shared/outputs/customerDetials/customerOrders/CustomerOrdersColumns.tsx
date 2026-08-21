import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate, formatTimestamp } from "@/functions/dates";
import { isDeadlinePast } from "@/functions/helpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IOrder } from "@/lib/models/order.model";
import { IUser } from "@/lib/models/user.model";
import { OrderSelectType } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const CustomerOrdersColumns = ():GridColDef[]=>{
    const {currency} = useCurrencyConfig();
    return [
        {
            field: 'createdAt',
            headerName: 'Ordered On',
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                return formatTimestamp(row?.createdAt)
            },
            valueGetter:(_, row:IOrder)=>{
                return formatTimestamp(row?.createdAt)
            },
            renderCell: (params:GridRenderCellParams)=>{
                const order = params?.row as IOrder;
                const date = formatTimestamp(order?.createdAt);
                return (
                    <Linker tableId="86" link={`/dashboard/transactions/orders?Id=${order?._id}`} placeholder={date || order?.createdAt} />
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
                            <Linker link={`/dashboard/products/types?Id=${item?.product?._id}`} tableId="28" placeholder={`${item?.quantity} x ${item?.product?.name}${index < products.length - 1 ? ', ':''}`} key={index} />
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
        }
        

    ]
}