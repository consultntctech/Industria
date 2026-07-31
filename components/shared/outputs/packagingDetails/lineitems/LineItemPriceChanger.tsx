import SearchSelectCurrencies from "@/components/shared/inputs/dropdowns/SearchSelectCurrencies";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { createPriceForAllLineItemsInPackage } from "@/lib/actions/lineitem.action";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { IOriginalPrice } from "@/types/Types";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { ComponentProps, useState } from "react";

type LineItemPriceChangerProps = {
    open:boolean;
    handleClose:()=>void;
    packageId: string;
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<ILineItem[], Error>>
} & ComponentProps<typeof TextField>

const LineItemPriceChanger = ({open, handleClose, refetch, packageId}:LineItemPriceChangerProps) => {
    const [otherCurrency, setOtherCurrency] = useState<IOtherCurrency | null>(null);
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState<number>(0);
    const {currency} = useCurrencyConfig();

    const finalPrice = price * (otherCurrency?.rate || 1);

    const original = {amount:price, rate:otherCurrency?.rate, currency:otherCurrency?._id} as IOriginalPrice

    
    const handlePriceAll = async()=>{
        setLoading(true);
        try {
            if(!price || isNaN(Number(price))){
                enqueueSnackbar('Please provide a valid price', {variant:'error'});
                return;
            }
            const res = await createPriceForAllLineItemsInPackage(packageId, finalPrice, original);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                refetch();
                // window.location.reload();
                handleClose();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while setting prices for all line items', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }
    const  title=`Set Price (${currency?.symbol || ''})`
    const content = `The price value you provide here will be set for all line items in this package. This will also override any existing prices set for individual line items.`;

    const costLabel = `Price (${currency?.symbol || currency?.name || 'Primary currency'})`;
    const otherLabel = `Price (${otherCurrency?.symbol || otherCurrency?.name})`;
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {content}
          </DialogContentText>
            <form id="price-form" >
              <GenericLabel
                label="Select currency"
                input={<SearchSelectCurrencies  setSelect={setOtherCurrency}  />}
              />
              <TextField
                autoFocus
                required
                margin="dense"
                label={otherCurrency ? otherLabel : costLabel}
                id="price"
                name="price"
                fullWidth
                variant="standard"
                onChange={(e)=>setPrice(Number(e.target.value))}
              />
              {
                otherCurrency &&
                <TextField
                    autoFocus
                    slotProps={{input:{readOnly:true}}}
                    margin="dense"
                    label={costLabel}
                    id="final-price"
                    name="final-price"
                    fullWidth
                    variant="standard"
                    value={finalPrice}
                />
              }
            </form>
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={handleClose}>Cancel</Button>
          <Button disabled={loading} onClick={handlePriceAll}  form="price-form">
            {loading ? 'Loading...' : 'Procced'}
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default LineItemPriceChanger