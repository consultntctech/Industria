import { useFetchOrgs } from "@/hooks/fetch/useFetchOrgs"
import { IOrganization } from "@/lib/models/org.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectOrgsProps = {
    setOrgId?: Dispatch<SetStateAction<string>>,
    value?: IOrganization | null,
    width?: number,
    required?:boolean,
}
const SearchSelectOrgs = ({setOrgId, required, value, width}:SearchSelectOrgsProps) => {
    const {orgs, isPending} = useFetchOrgs();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={orgs}
            onChange={(_, item:IOrganization|null)=>{
                if(setOrgId){
                    setOrgId(item?._id as string)
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
                    label= {"Organization"}
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

export default SearchSelectOrgs