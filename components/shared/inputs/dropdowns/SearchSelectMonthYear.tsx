// import { useFetchAvailableGoods } from "@/hooks/fetch/useFetchGoods"
// import { ITable } from "@/lib/models/good.model"
import { LastTwelveMonths } from "@/Data/Dashboard"
import {  IYearMonth } from "@/types/Types"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectMonthYearProps = {
    setSelect?: Dispatch<SetStateAction<IYearMonth | null>>,
    value?: IYearMonth | null,
    width?: number,
    required?:boolean,
}
const SearchSelectMonthYear = ({setSelect, required, value, width}:SearchSelectMonthYearProps) => {
    // const {goods, isPending} = useFetchAvailableGoods();
    const [search, setSearch] = useState<string>('');
    // const data = LastTwelveMonths;

    return(
        <Autocomplete
            disablePortal
            options={LastTwelveMonths}
            onChange={(_, item:IYearMonth|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item)
                }
            }}
            defaultValue={value}
            inputValue={search}
            onInputChange={(_, item)=>{
                setSearch(item);
            }}
            loading={!LastTwelveMonths}
            isOptionEqualToValue={(option, v)=>option.id === v.id}
            getOptionLabel={(option)=>`${option?.month} ${option?.year}`}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Month"
                    color="primary"
                    className="rounded"
                    slotProps={{
                        input:{
                            ...params.InputProps,
                            endAdornment:(
                                <Fragment>
                                    {!LastTwelveMonths ? <CircularProgress size={20} color="inherit" />: null}
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

export default SearchSelectMonthYear