import { Paper, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
// import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction } from 'react'
import {  IRMaterial, IRMaterialPopulate } from '@/lib/models/rmaterial.mode'
// import { deleteRMaterial } from '@/lib/actions/rmaterial.action'
import { ProdRMColumns } from './ProdRMColumn'
import { IProduction } from '@/lib/models/production.model'
import { GoPencil } from 'react-icons/go'
import { useAuth } from '@/hooks/useAuth'
import { canUser } from '@/Data/roles/permissions'

type ProdRMTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    // setOpenItem:Dispatch<SetStateAction<boolean>>;
    production: IProduction | null;
}

const ProdRMTable = ({setOpenNew, production}:ProdRMTableProps) => {

    const materials = production?.ingredients as unknown as IRMaterialPopulate[];
    const {user} = useAuth();
    const isEditor = canUser(user, '8', 'UPDATE');


    // console.log('Materials: ', materials)


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = ()=>{
        setOpenNew(true);
        // setOpenItem(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    


    // const handleDeleteItem = async()=>{
    //     try {
    //         if(!currentMaterial) return;
    //         const res = await deleteRMaterial(currentMaterial?._id);
    //         enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
    //         handleClose();
    //         if(!res.error){
    //             refetch();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         enqueueSnackbar('Error occured while deleting product', {variant:'error'});
    //     }
    // }


    // const content = currentMaterial ? `Are you sure you want to remove raw material ${currentMaterial?.materialName} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <div className="flex flex-row items-center gap-6">
            <span className='font-bold text-xl' >Raw Materials</span>
            {
                !(production?.status === 'Pending Approval' || production?.status === 'Approved') && isEditor &&
                <Tooltip title="Edit production content">
                    <GoPencil onClick={handleEdit}  className="cursor-pointer text-blue-700" />
                </Tooltip>
            }
        </div>
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={!production}
                        getRowId={(row:IRMaterialPopulate)=>{
                            const material = row?.materialId as IRMaterial;
                            return material?._id;
                        }}
                        rows={materials}
                        columns={ProdRMColumns( )}
                        initialState={{ 
                            pagination: { paginationModel },
                            
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

export default ProdRMTable