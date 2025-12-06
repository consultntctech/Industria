// import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {  useFetchLineItemsByPackage } from '@/hooks/fetch/useFetchLineItems'
import LineItemsInfoModal from './LineItemsInfoModal'
import { IPackage } from '@/lib/models/package.model'
import { ILineItem } from '@/lib/models/lineitem.model'
import { createPriceForAllLineItemsInPackage, getLineItem } from '@/lib/actions/lineitem.action'
import { LineItemsColumns } from './LineItemsColumns'
import LineItemEditComp from './LineItemEditComp'
// import { IoPricetagOutline } from 'react-icons/io5'
import PrimaryButton from '@/components/shared/buttons/PrimaryButton'
import DialogueAlertWithInput from '@/components/misc/DialogueAlertWithInput'
import { useCurrencyConfig } from '@/hooks/config/useCurrencyConfig'

type LineItemTableProps = {
    pack:IPackage | null;
}

const LineItemsTable = ({ pack}:LineItemTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showPriceAll, setShowPriceAll] = useState(false);
    const [currentLineItem, setCurrentLineItem] = useState<ILineItem | null>(null);
    const [price, setPrice] = useState<string>('');

    const {currency} = useCurrencyConfig();

    const {lineItems, isPending, refetch} = useFetchLineItemsByPackage(pack?._id as string);
    const searchParams = useSearchParams();
    const LineItemId = searchParams.get("Id");

    useEffect(() => {
        if (!LineItemId) return;

        let isMounted = true;

        const fetchLineItem = async () => {
            try {
            const res = await getLineItem(LineItemId);
            if (!isMounted) return;

            const userData = res.payload as ILineItem;
            if (!res.error) {
                setCurrentLineItem(userData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching line item", { variant: "error" });
            }
            }
        };

        fetchLineItem();

        return () => {
            isMounted = false;
        };
    }, [LineItemId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (item:ILineItem)=>{
        setCurrentLineItem(item);
        setShowEdit(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (item:ILineItem)=>{
        setShowInfo(true);
        setCurrentLineItem(item);
    }


    const handleClose = ()=>{
        setShowPriceAll(false);
    }

    const handlePriceAll = async()=>{
        try {
            if(!price || isNaN(Number(price))){
                enqueueSnackbar('Please provide a valid price', {variant:'error'});
                return;
            }
            const res = await createPriceForAllLineItemsInPackage(pack?._id as string, Number(price));
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                refetch();
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while setting prices for all line items', {variant:'error'});
        }
    }


    // const content = currentLineItem ? `Are you sure you want to delete Finished LineItems ${currentLineItem.name} ? This will also delete all packaged items for these goods.` : '';
    const content = `The price value you provide here will be set for all line items in this package. This will also override any existing prices set for individual line items.`;
  return (
    <div className='table-main2' >
        <div className="flex items-center justify-between gap-5">
            <span className='font-bold text-xl' >Line Items</span>
                <PrimaryButton onClick={()=>setShowPriceAll(true)} text={`Set price for all`} className='px-4 py-1' />
            {/* <Tooltip title="Set prices all line items">
            </Tooltip> */}
        </div>
        <DialogueAlertWithInput onChange={(e)=>setPrice(e.target.value)} agreeClick={handlePriceAll} handleClose={handleClose} open={showPriceAll}  title={`Set Price (${currency?.symbol || ''})`} content={content} />
        <LineItemsInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentLineItem={currentLineItem} setCurrentLineItem={setCurrentLineItem} />
        <LineItemEditComp showEdit={showEdit} setShowEdit={setShowEdit} currentLineItem={currentLineItem} setCurrentLineItem={setCurrentLineItem} refetch={refetch} />
        {/* <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete LineItem" content={content} /> */}
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:ILineItem)=>row._id}
                        rows={lineItems}
                        columns={LineItemsColumns(handleInfo, handleEdit)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  package: false,
                                  name: false,
                                  batch: false,
                                  good: false,
                                  createdBy:false,
                                  createdAt:false,
                                  updatedAt:false,
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

export default LineItemsTable