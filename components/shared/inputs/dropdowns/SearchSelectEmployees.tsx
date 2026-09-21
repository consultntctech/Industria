import { useFetchEmployees } from "@/hooks/fetch/useFetchEmployees";
import { IEmployee } from "@/lib/models/employee.model";
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectEmployeesProps = {
    setSelect?: Dispatch<SetStateAction<IEmployee | null>>,
    value?: IEmployee | null,
    width?: number,
    required?:boolean,
    disabled?: boolean,
    showMe?:boolean,
    placeholder?:string,
}
const SearchSelectEmployees = ({setSelect, required, value, width, disabled, showMe, placeholder}:SearchSelectEmployeesProps) => {
    const {employees, isPending} = useFetchEmployees(showMe);
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={employees}
            onChange={(_, item:IEmployee|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item)
                }
            }}
            disabled={disabled}
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
                    label= {placeholder || "Employee"}
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

export default SearchSelectEmployees