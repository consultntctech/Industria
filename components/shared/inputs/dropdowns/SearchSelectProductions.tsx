import { useFetchProductions } from "@/hooks/fetch/useFetchProductions"
import { IProduction } from "@/lib/models/production.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectProductionsProps = {
    setSelect?: Dispatch<SetStateAction<IProduction | null>>,
    value?: IProduction | null,
    width?: number,
    required?:boolean,
}
const SearchSelectProductions = ({setSelect, required, value, width}:SearchSelectProductionsProps) => {
    const {productions, isPending} = useFetchProductions();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={productions}
            onChange={(_, item:IProduction|null)=>{
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
                    label= "Production"
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

export default SearchSelectProductions