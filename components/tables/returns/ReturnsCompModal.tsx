import SearchSelectCustomers from "@/components/shared/inputs/dropdowns/SearchSelectCustomers";
import { deleteReturns } from "@/lib/actions/returns.action";
import { createSales } from "@/lib/actions/sales.action";
import { ICustomer } from "@/lib/models/customer.model";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IReturns } from "@/lib/models/returns.model";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FormEvent,  SetStateAction, useState } from "react";

type ReturnsCompModalProps = {
    currentReturn: IReturns | null;
    setCurrentReturn:Dispatch<SetStateAction<IReturns | null>>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IReturns[], Error>>
}

const ReturnsCompModal = ({currentReturn, refetch, setCurrentReturn, open, setOpen}:ReturnsCompModalProps) => {
    const products = currentReturn?.products as ILineItem[];
    const [customer, setCustomer] = useState<ICustomer | null>(null);

    const handleClose = ()=>{
        setOpen(false);
        setCurrentReturn(null);
    }

    const agreeClick = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            if(!currentReturn || !customer) return;
            const {createdAt, updatedAt, ...returnsData} = currentReturn;
            const retData:Partial<IReturns> = {
                ...returnsData,
                products: products.map((p)=>p._id),
                customer: customer._id,
            }
            const res = await deleteReturns(currentReturn._id);
            enqueueSnackbar(res.message, {variant: res.error ? 'error' : 'success'});
            if(!res.error){
                const retRes = await createSales(retData);
                enqueueSnackbar(retRes.message, {variant: retRes.error ? 'error' : 'success'});
                if(!retRes.error){
                    refetch();
                    handleClose();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Resale</DialogTitle>
        <DialogContent>
            <DialogContentText>
            Select a customer to proceed with resale of returned {products?.length > 1 ? 'items' : 'item'}.
            </DialogContentText>
            <form onSubmit={agreeClick} id="return-component-form">
                <SearchSelectCustomers required setSelect={setCustomer} />
            </form>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button type="submit"  form="return-component-form">
                Proceed
            </Button>
        </DialogActions>
    </Dialog>
  )
}

export default ReturnsCompModal