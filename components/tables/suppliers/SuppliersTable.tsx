import { useFetchSuppliers } from "@/hooks/fetch/useFetchSuppliers";
import { deleteSupplier, getSupplier } from "@/lib/actions/supplier.action";
import { ISupplier } from "@/lib/models/supplier.model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SupplierColoumns } from "./SupplierColumns";
import DialogueAlet from "@/components/misc/DialogueAlet";
import SuppliersInfoModal from "./SuppliersInfoModal";
import { useSearchParams } from "next/navigation";

type SuppliersTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentSupplier:ISupplier | null;
    setCurrentSupplier:Dispatch<SetStateAction<ISupplier | null>>;
}

const SuppliersTable = ({setOpenNew, currentSupplier, setCurrentSupplier}:SuppliersTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    

    const {suppliers, isPending, refetch} = useFetchSuppliers();


    const searchParams = useSearchParams();
        const supplierId = searchParams.get("Id");
    
        useEffect(() => {
            if (!supplierId) return;
    
            let isMounted = true;
    
            const fetchSupplier = async () => {
                try {
                const res = await getSupplier(supplierId);
                if (!isMounted) return;
    
                const item = res.payload as ISupplier;
                if (!res.error) {
                    setCurrentSupplier(item);
                    setShowInfo(true);
                }
                } catch (error) {
                if (isMounted) {
                    enqueueSnackbar("Error occurred while fetching supplier", { variant: "error" });
                }
                }
            };
    
            fetchSupplier();
    
            return () => {
                isMounted = false;
            };
        }, [supplierId]);


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:ISupplier)=>{
        setCurrentSupplier(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (user:ISupplier)=>{
        setShowInfo(true);
        setCurrentSupplier(user);
    }

    const handleDelete = (user:ISupplier)=>{
        setShowDelete(true);
        setCurrentSupplier(user);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentSupplier(null);
    }

    const handleDeleteUser = async()=>{
        try {
            if(!currentSupplier) return;
            const res = await deleteSupplier(currentSupplier?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting supplier', {variant:'error'});
        }
    }


    const content = currentSupplier ? `Are you sure you want to delete supplier ${currentSupplier.name}? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Suppliers</span>
        <SuppliersInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentSupplier={currentSupplier} setCurrentSupplier={setCurrentSupplier} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteUser} title="Delete Supplier" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:ISupplier)=>row._id}
                        rows={suppliers}
                        columns={SupplierColoumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
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

export default SuppliersTable