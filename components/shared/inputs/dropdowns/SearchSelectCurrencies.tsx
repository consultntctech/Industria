import { useFetchOtherCurrencyByOrg } from "@/hooks/fetch/useFetchOtherCurrency";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectCurrenciesProps = {
    setSelect?: Dispatch<SetStateAction<IOtherCurrency | null>>,
    value?: IOtherCurrency | null,
    width?: number,
    required?:boolean,
}
const SearchSelectCurrencies = ({setSelect, required, value, width}:SearchSelectCurrenciesProps) => {
    const {currencies, isPending} = useFetchOtherCurrencyByOrg();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={currencies}
            onChange={(_, item:IOtherCurrency|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item);
                }
            }}
            defaultValue={value}
            inputValue={search}
            onInputChange={(_, item)=>{
                setSearch(item);
            }}
            loading={isPending}
            isOptionEqualToValue={(option, v)=>option._id === v._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Currency"
                    color="primary"
                    className="rounded"
                    slotProps={{
                        input:{
                            ...params.InputProps,
                            endAdornment:(
                                <Fragment>
                                    {isPending ? <CircularProgress size={20} color="inherit" />: null}
                                    {params.InputProps.endAdornment}
                                </Fragment>
                            )
                        }
                    }}
                />
            )}
        >

        </Autocomplete>
    )
}

export default SearchSelectCurrencies