import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IGood } from '@/lib/models/good.model'
import { useFetchGoods } from '@/hooks/fetch/useFetchGoods'
import { deleteGood, getGood } from '@/lib/actions/good.action'
import GoodsInfoModal from './GoodsInfoModal'
import { GoodColumns } from './GoodsColumns'

type GoodTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentGood:IGood | null;
    setCurrentGood:Dispatch<SetStateAction<IGood | null>>;
}

const GoodTable = ({setOpenNew, currentGood, setCurrentGood}:GoodTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const {goods, isPending, refetch} = useFetchGoods();
    const searchParams = useSearchParams();
    const GoodId = searchParams.get("Id");

    useEffect(() => {
        if (!GoodId) return;

        let isMounted = true;

        const fetchGood = async () => {
            try {
            const res = await getGood(GoodId);
            if (!isMounted) return;

            const userData = res.payload as IGood;
            if (!res.error) {
                setCurrentGood(userData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching goods", { variant: "error" });
            }
            }
        };

        fetchGood();

        return () => {
            isMounted = false;
        };
    }, [GoodId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (item:IGood)=>{
        setCurrentGood(item);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (item:IGood)=>{
        setShowInfo(true);
        setCurrentGood(item);
    }

    const handleDelete = (item:IGood)=>{
        setShowDelete(true);
        setCurrentGood(item);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentGood(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentGood) return;
            const res = await deleteGood(currentGood?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting goods', {variant:'error'});
        }
    }


    const content = currentGood ? `Are you sure you want to delete Finished Goods ${currentGood.name} ? This will also delete all packaged items for these goods.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Goods</span>
        <GoodsInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentGood={currentGood} setCurrentGood={setCurrentGood} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Good" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IGood)=>row._id}
                        rows={goods}
                        columns={GoodColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  production: false,
                                  batch: false,
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

export default GoodTable