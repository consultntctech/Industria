import { useFetchUsers } from "@/hooks/fetch/useFetchUsers"
import { IUser } from "@/lib/models/user.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectUsersProps = {
    setSelect?: Dispatch<SetStateAction<string>>,
    value?: IUser | null,
    width?: number,
    required?:boolean,
}
const SearchSelectUsers = ({setSelect, required, value, width}:SearchSelectUsersProps) => {
    const {users, isPending} = useFetchUsers();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={users}
            onChange={(e, item:IUser|null)=>{
                console.log(e.target)
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
            isOptionEqualToValue={(option, value)=>option._id === value._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "User"
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

export default SearchSelectUsers