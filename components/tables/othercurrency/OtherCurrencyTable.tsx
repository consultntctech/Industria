import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { deleteOtherCurrency, getOtherCurrency } from '@/lib/actions/othercurrency.action';
import { IOtherCurrency } from '@/lib/models/othercurrency.model';
import { OtherCurrencyColumns } from './OtherCurrencyColumns';
import { ICurrency } from '@/lib/models/currency.model';
import SecondaryButton from '@/components/shared/buttons/SecondaryButton';
import { useFetchOtherCurrencyByOrg } from '@/hooks/fetch/useFetchOtherCurrency';
import OtherCurrencyComp from './OtherCurrencyComp';

type OtherCurrencyTableProps = {
    currency:ICurrency | null | undefined;
    isSuccess:boolean;
}

const OtherCurrencyTable = ({  isSuccess, currency}:OtherCurrencyTableProps) => {
    const [showDelete, setShowDelete] = useState(false);
    const [openNew, setOpenNew] = useState(false);
    const [currentOtherCurrency, setCurrentOtherCurrency] = useState<IOtherCurrency | null>(null);
    const {currencies, isPending, refetch} = useFetchOtherCurrencyByOrg();
    
    const searchParams = useSearchParams();
    const StorageId = searchParams.get("Id");

    useEffect(() => {
        if (!StorageId) return;

        let isMounted = true;

        const fetchUser = async () => {
            try {
            const res = await getOtherCurrency(StorageId);
            if (!isMounted) return;

            const userData = res.payload as IOtherCurrency;
            if (!res.error) {
                setCurrentOtherCurrency(userData);
                setOpenNew(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching OtherCurrency location", { variant: "error" });
            }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, [StorageId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (currency:IOtherCurrency)=>{
        setCurrentOtherCurrency(currency);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

   

    const handleDelete = (currency:IOtherCurrency)=>{
        setShowDelete(true);
        setCurrentOtherCurrency(currency);
    }

    const handleClose = ()=>{
        setOpenNew(false);
        setShowDelete(false);
        setCurrentOtherCurrency(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentOtherCurrency) return;
            const res = await deleteOtherCurrency(currentOtherCurrency?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting currency', {variant:'error'});
        }
    }


    const content = currentOtherCurrency ? `Are you sure you want to delete currency, ${currentOtherCurrency.name} ? This action cannot be undone.` : '';

  return (
    <div className="flex p-4 lg:p-8 w-full">
        <OtherCurrencyComp openNew={openNew} setOpenNew={setOpenNew} currentOtherCurrency={currentOtherCurrency} setCurrentOtherCurrency={setCurrentOtherCurrency} refetch={refetch} currency={currency} />
        <div className='max-w-[78vw] xl:max-w-[74vw] w-full bg-white gap-4 p-4 flex flex-col rounded shadow border border-gray-200' >
            {
                (isSuccess && !currency) ?
                <>
                <span className='font-bold text-xl' >Other currencies</span>
                <span className='greyText' >This feature is only availble when you set up your primary currency</span>
                </>
                :
                <>
                    <div className="flex items-center justify-between gap-4">
                        <span className='font-bold text-xl' >Other currencies</span>
                        <SecondaryButton type='button' text="Add currency" className='text-xs px-4' onClick={()=>setOpenNew(true)} />
                    </div>
                    <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete currency" content={content} />
                    <div className="flex w-full">
                        {
                            // loading ? 
                            // <LinearProgrewss className='w-full' />
                            // :
                            <Paper className='w-full' sx={{ height: 'auto', }}>
                                <DataGrid
                                    loading={isPending}
                                    getRowId={(row:IOtherCurrency)=>row._id}
                                    rows={currencies}
                                    columns={OtherCurrencyColumns( handleEdit, handleDelete)}
                                    initialState={{ 
                                        pagination: { paginationModel },
                                        columns:{
                                            columnVisibilityModel:{
                                                // note: false,
                                                createdAt:false,
                                                creator: false,
                                                createdBy: false
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
                </>
            }
        </div>
    </div>
  )
}

export default OtherCurrencyTable