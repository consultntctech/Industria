import { useFetchStorages } from "@/hooks/fetch/useFetchStorages"
import { IStorage } from "@/lib/models/storage.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectStoragesProps = {
    setSelect?: Dispatch<SetStateAction<string>>,
    value?: IStorage | null,
    width?: number,
    required?:boolean,
}
const SearchSelectStorages = ({setSelect, required, value, width}:SearchSelectStoragesProps) => {
    const {storages, isPending} = useFetchStorages();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={storages}
            onChange={(_, item:IStorage|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item?._id as string)
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
                    label= "Storage Location"
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

export default SearchSelectStorages