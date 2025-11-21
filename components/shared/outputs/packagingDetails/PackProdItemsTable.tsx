import { Paper, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
// import { enqueueSnackbar } from 'notistack'
import React, { Dispatch, SetStateAction } from 'react'
// import { deleteRMaterial } from '@/lib/actions/rmaterial.action'
import { GoPencil } from 'react-icons/go'
import { IProdItem } from '@/lib/models/proditem.model'
import { IPackage, IProdItemPopulate } from '@/lib/models/package.model'
import { PackProdItemsColumn } from './PackProdItemsColumn'

type PackProdItemsTableProps = {
    // setOpenNew:Dispatch<SetStateAction<boolean>>;
    setOpenItem:Dispatch<SetStateAction<boolean>>;
    pack: IPackage | null;
}

const PackProdItemsTable = ({ setOpenItem,  pack}:PackProdItemsTableProps) => {

    const materials = pack?.packagingMaterial as unknown as IProdItemPopulate[];


    // console.log('Materials: ', materials)


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = ()=>{
        // setOpenNew(false);
        setOpenItem(true);
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
            <span className='font-bold text-xl' >Packaging Materials</span>
            {
                pack?.approvalStatus !== 'Approved' &&
                <Tooltip title="Edit packaging items">
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
                        loading={!pack}
                        getRowId={(row:IProdItemPopulate)=>{
                            const material = row?.materialId as IProdItem;
                            return material?._id;
                        }}
                        rows={materials}
                        columns={PackProdItemsColumn( )}
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

export default PackProdItemsTable