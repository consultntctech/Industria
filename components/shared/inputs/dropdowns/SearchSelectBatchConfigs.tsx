import { useAllBatchNoConfig } from "@/hooks/config/useBatchNoConfig"
import { IBatchConfig } from "@/lib/models/batchconfig.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectBatchConfigsProps = {
    setSelect?: Dispatch<SetStateAction<string>>,
    value?: IBatchConfig | null,
    width?: number,
    required?:boolean,
}
const SearchSelectBatchConfigs = ({setSelect, required, value, width}:SearchSelectBatchConfigsProps) => {
    const {batchConfigs, isPending} = useAllBatchNoConfig();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={batchConfigs}
            onChange={(_, item:IBatchConfig|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item?._id as string)
                }
            }}
            defaultValue={value}
            inputValue={search}
            onInputChange={(_, item)=>{
                // console.log(e.target);
                setSearch(item);
            }}
            loading={isPending}
            isOptionEqualToValue={(option, v)=>option._id === v._id}
            getOptionLabel={(option)=>option?.mode}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= {'Configuration'}
                    color="primary"
                    // defaultValue={value}
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

export default SearchSelectBatchConfigs