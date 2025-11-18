import { useFetchAvailableGoods } from "@/hooks/fetch/useFetchGoods"
import { IGood } from "@/lib/models/good.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectGoodsProps = {
    setSelect?: Dispatch<SetStateAction<IGood | null>>,
    value?: IGood | null,
    width?: number,
    required?:boolean,
}
const SearchSelectGoods = ({setSelect, required, value, width}:SearchSelectGoodsProps) => {
    const {goods, isPending} = useFetchAvailableGoods();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={goods}
            onChange={(_, item:IGood|null)=>{
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
            loading={isPending}
            isOptionEqualToValue={(option, value)=>option._id === value._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Finished Goods"
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

export default SearchSelectGoods