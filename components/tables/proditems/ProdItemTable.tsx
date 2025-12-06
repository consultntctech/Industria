import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ProductInfoModal from './ProdItemInfoModal'
import { useSearchParams } from 'next/navigation'
import { IProdItem } from '@/lib/models/proditem.model'
import { useFetchProditem } from '@/hooks/fetch/useFetchProditem'
import { deleteProdItem, getProdItem } from '@/lib/actions/proditem.action'
import { ProdItemColumns } from './ProdItemColumns'

type ProdItemTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentProdItem:IProdItem | null;
    setCurrentProdItem:Dispatch<SetStateAction<IProdItem | null>>;
}

const ProdItemTable = ({setOpenNew, currentProdItem, setCurrentProdItem}:ProdItemTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const {proditems, isPending, refetch} = useFetchProditem();
    const searchParams = useSearchParams();
    const productId = searchParams.get("Id");

    useEffect(() => {
        if (!productId) return;

        let isMounted = true;

        const fetchItem = async () => {
            try {
            const res = await getProdItem(productId);
            if (!isMounted) return;

            const userData = res.payload as IProdItem;
            if (!res.error) {
                setCurrentProdItem(userData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching production item", { variant: "error" });
            }
            }
        };

        fetchItem();

        return () => {
            isMounted = false;
        };
    }, [productId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:IProdItem)=>{
        setCurrentProdItem(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (user:IProdItem)=>{
        setShowInfo(true);
        setCurrentProdItem(user);
    }

    const handleDelete = (user:IProdItem)=>{
        setShowDelete(true);
        setCurrentProdItem(user);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentProdItem(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentProdItem) return;
            const res = await deleteProdItem(currentProdItem?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting production item', {variant:'error'});
        }
    }


    const content = currentProdItem ? `Are you sure you want to delete production item ${currentProdItem.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Materials</span>
        <ProductInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentProdItem={currentProdItem} setCurrentProdItem={setCurrentProdItem} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Item" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IProdItem)=>row._id}
                        rows={proditems}
                        columns={ProdItemColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                //   unitPrice: false,
                                  uom: false,
                                  qStatus: false,
                                  used: false,
                                  threshold: false,
                                  reusable: false,
                                  quantity: false,
                                  materialName: false,
                                  category:false,
                                  description: false,
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

export default ProdItemTable