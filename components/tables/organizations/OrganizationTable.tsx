import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IOrganization } from '@/lib/models/org.model'
import { useFetchOrgs } from '@/hooks/fetch/useFetchOrgs'
import { deleteOrg, getOrg } from '@/lib/actions/org.action'
import OrganizationInfoModal from './OrganizationInfoModal'
import { OrganizationColumns } from './OrganizationColumns'

type OrganizationTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentOrganization:IOrganization | null;
    setCurrentOrganization:Dispatch<SetStateAction<IOrganization | null>>;
}

const OrganizationTable = ({setOpenNew, currentOrganization, setCurrentOrganization}:OrganizationTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const {orgs, isPending, refetch} = useFetchOrgs();
    const searchParams = useSearchParams();
    const orgId = searchParams.get("Id");

    useEffect(() => {
        if (!orgId) return;

        let isMounted = true;

        const fetchOrganization = async () => {
            try {
            const res = await getOrg(orgId);
            if (!isMounted) return;

            const orgData = res.payload as IOrganization;
            if (!res.error) {
                setCurrentOrganization(orgData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching organization", { variant: "error" });
            }
            }
        };

        fetchOrganization();

        return () => {
            isMounted = false;
        };
    }, [orgId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (org:IOrganization)=>{
        setCurrentOrganization(org);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (org:IOrganization)=>{
        setShowInfo(true);
        setCurrentOrganization(org);
    }

    const handleDelete = (org:IOrganization)=>{
        setShowDelete(true);
        setCurrentOrganization(org);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentOrganization(null);
    }

    const handleDeleteOrganization = async()=>{
        try {
            if(!currentOrganization) return;
            const res = await deleteOrg(currentOrganization?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting organization', {variant:'error'});
        }
    }


    const content = currentOrganization ? `Deleting an organization will delete all items related to it, including users. Are you sure you want to delete this organization?` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Organizations</span>
        <OrganizationInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentOrganization={currentOrganization} setCurrentOrganization={setCurrentOrganization} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteOrganization} title="Delete Organization" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IOrganization)=>row._id}
                        rows={orgs}
                        columns={OrganizationColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  logo:false,
                                  description:false,
                                  appName:false,
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

export default OrganizationTable