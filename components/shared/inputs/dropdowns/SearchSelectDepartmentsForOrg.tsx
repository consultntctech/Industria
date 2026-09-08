
import {  useFetchDepartments } from "@/hooks/fetch/useFetchDepartments";
import { IDepartment } from "@/lib/models/department.model";
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectDepartmentsForOrgProps = {
    setSelect?: Dispatch<SetStateAction<IDepartment | null>>,
    value?: IDepartment | null,
    width?: number,
    required?:boolean,
    disabled?: boolean,
}
const SearchSelectDepartmentsForOrg = ({ setSelect, required, disabled, value, width}:SearchSelectDepartmentsForOrgProps) => {
    const {departments, isPending} = useFetchDepartments();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            disabled={disabled}
            options={departments}
            onChange={(_, item:IDepartment|null)=>{
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
            isOptionEqualToValue={(option, v)=>option._id === v._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Department"
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

export default SearchSelectDepartmentsForOrg