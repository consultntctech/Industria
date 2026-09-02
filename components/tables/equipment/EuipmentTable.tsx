import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSystemAdmin } from '@/Data/roles/permissions'
import { EquipmentColumns } from './EquipmentColumns';
import { useFetchEquipment } from '@/hooks/fetch/useFetchEquipment';
import { deleteEquipment, getEquipmentById } from '@/lib/actions/equipment.action';
import { IEquipment } from '@/lib/models/equipment.model';
import EquipmentInfoModal from './EquipmentInfoModal';

type EuipmentTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentEquipment:IEquipment | null;
    setCurrentEquipment:Dispatch<SetStateAction<IEquipment | null>>;
}

const EuipmentTable = ({setOpenNew, currentEquipment, setCurrentEquipment}:EuipmentTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {equipment, isPending, refetch} = useFetchEquipment();
    const searchParams = useSearchParams();
    const equipmentId = searchParams.get("Id");

    useEffect(() => {
        if (!equipmentId) return;

        let isMounted = true;

        const fetchEType = async () => {
            try {
            const res = await getEquipmentById(equipmentId);
            if (!isMounted) return;

            const equipData = res.payload as IEquipment;
            if (!res.error) {
                setCurrentEquipment(equipData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching equipment", { variant: "error" });
            }
            }
        };

        fetchEType();

        return () => {
            isMounted = false;
        };
    }, [equipmentId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (equip:IEquipment)=>{
        setCurrentEquipment(equip);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (equip:IEquipment)=>{
        setShowInfo(true);
        setCurrentEquipment(equip);
    }

    const handleDelete = (equip:IEquipment)=>{
        setShowDelete(true);
        setCurrentEquipment(equip);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentEquipment(null);
    }

    const handleDeleteEType = async()=>{
        try {
            if(!currentEquipment) return;
            const res = await deleteEquipment(currentEquipment?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting equipment', {variant:'error'});
        }
    }


    const content = currentEquipment ? `Are you sure you want to delete equipment ${currentEquipment?.name}? . This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Equipment</span>
        <EquipmentInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentEquipment={currentEquipment} setCurrentEquipment={setCurrentEquipment} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteEType} title="Delete equipment" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IEquipment)=>row._id}
                        rows={equipment}
                        columns={EquipmentColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:isAdmin,
                                  createdAt:false,
                                  updatedAt:false,
                                  description:false,
                                  createdBy:false,
                                  model: false,
                                  serialNumber: false,
                                  tag: false,
                                  location: false,
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

export default EuipmentTable