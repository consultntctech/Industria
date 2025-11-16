import { useFetchCustomers } from "@/hooks/fetch/useFetchCustomers";
import { deleteCustomer, getCustomer } from "@/lib/actions/customer.action";
import { ICustomer } from "@/lib/models/customer.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogueAlet from "@/components/misc/DialogueAlet";
import CustomersInfoModal from "./CustomersInfoModal";
import { useSearchParams } from "next/navigation";
import { CustomersColoumns } from "./CustomersColumns";

type CustomersTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentCustomer:ICustomer | null;
    setCurrentCustomer:Dispatch<SetStateAction<ICustomer | null>>;
}

const CustomersTable = ({setOpenNew, currentCustomer, setCurrentCustomer}:CustomersTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    

    const {customers, isPending, refetch} = useFetchCustomers();


    const searchParams = useSearchParams();
        const CustomerId = searchParams.get("Id");
    
        useEffect(() => {
            if (!CustomerId) return;
    
            let isMounted = true;
    
            const fetchCustomer = async () => {
                try {
                const res = await getCustomer(CustomerId);
                if (!isMounted) return;
    
                const item = res.payload as ICustomer;
                if (!res.error) {
                    setCurrentCustomer(item);
                    setShowInfo(true);
                }
                } catch (error) {
                if (isMounted) {
                    enqueueSnackbar("Error occurred while fetching customer", { variant: "error" });
                }
                }
            };
    
            fetchCustomer();
    
            return () => {
                isMounted = false;
            };
        }, [CustomerId]);


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (item:ICustomer)=>{
        setCurrentCustomer(item);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (item:ICustomer)=>{
        setShowInfo(true);
        setCurrentCustomer(item);
    }

    const handleDelete = (item:ICustomer)=>{
        setShowDelete(true);
        setCurrentCustomer(item);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentCustomer(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentCustomer) return;
            const res = await deleteCustomer(currentCustomer?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting Customer', {variant:'error'});
        }
    }


    const content = currentCustomer ? `Are you sure you want to delete Customer ${currentCustomer.name}? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Customers</span>
        <CustomersInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentCustomer={currentCustomer} setCurrentCustomer={setCurrentCustomer} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Customer" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:ICustomer)=>row._id}
                        rows={customers}
                        columns={CustomersColoumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
                                  org:false,
                                }
                              }
                         }}
                        pageSizeOptions={[5, 10, 15, 20, 30, 50, 100]}
                        // checkboxSelection
                        className='dark:bg-[#0F1214] dark:border dark:text-blue-800'
                        sx={{ border: 0 }}
                        // slots={{toolbar:GridToolbar}}
                        showToolbar
                        slotProps={{
                            toolbar:{
                                showQuickFilter:true,
                                printOptions:{
                                    hideFooter:true, hideToolbar:true
                                }
                            }
                        }}
                    />
                </Paper>
            }
        </div>
    </div>
  )
}

export default CustomersTable