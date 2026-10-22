import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IProdType } from '@/lib/models/prodtype.model';
import { deleteProdType, getProdType } from '@/lib/actions/prodtype.action';
import { useFetchProdTypes } from '@/hooks/fetch/useFetchProdTypes';
import { ProdTypeColumns } from './ProdTypeColumns';
import ProdTypeInfoModal from './ProdTypeInfoModal';

type ProdTypesTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentProdType:IProdType | null;
    setCurrentProdType:Dispatch<SetStateAction<IProdType | null>>;
}

const ProdTypesTable = ({setOpenNew, currentProdType, setCurrentProdType}:ProdTypesTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const {prodTypes, isPending, refetch} = useFetchProdTypes();
    const searchParams = useSearchParams();
    const productId = searchParams.get("Id");

    useEffect(() => {
        if (!productId) return;

        let isMounted = true;

        const fetchItem = async () => {
            try {
            const res = await getProdType(productId);
            // console.log(res)
            if (!isMounted) return;

            const data = res.payload as IProdType;
            if (!res.error) {
                setCurrentProdType(data);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching packaging meterial type", { variant: "error" });
            }
            }
        };

        fetchItem();

        return () => {
            isMounted = false;
        };
    }, [productId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:IProdType)=>{
        setCurrentProdType(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (user:IProdType)=>{
        setShowInfo(true);
        setCurrentProdType(user);
    }

    const handleDelete = (user:IProdType)=>{
        setShowDelete(true);
        setCurrentProdType(user);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentProdType(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentProdType) return;
            const res = await deleteProdType(currentProdType?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting packaging material type', {variant:'error'});
        }
    }


    const content = currentProdType ? `Are you sure you want to delete packaing material item ${currentProdType?.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Types</span>
        <ProdTypeInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentProdType={currentProdType} setCurrentProdType={setCurrentProdType} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Item" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IProdType)=>row._id}
                        rows={prodTypes}
                        columns={ProdTypeColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  suppliers: false,
                                  description: false,
                                  uom: false,
                                  used: false,
                                //   stock: false,
                                  materialName: false,
                                  category:false,
                                  storages: false,
                                  original: false,
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

export default ProdTypesTable