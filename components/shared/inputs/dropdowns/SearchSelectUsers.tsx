import { useFetchUsers } from "@/hooks/fetch/useFetchUsers"
import { IUser } from "@/lib/models/user.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
// import { enqueueSnackbar } from "notistack"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectUsersProps = {
    setSelect?: Dispatch<SetStateAction<IUser | null>>,
    value?: IUser | null,
    width?: number,
    required?:boolean,
    showMe?:boolean,
    showAdmins?:boolean
}
const SearchSelectUsers = ({setSelect, required, showMe, showAdmins, value, width}:SearchSelectUsersProps) => {
    const {users, isPending} = useFetchUsers(showMe, showAdmins);
    const [search, setSearch] = useState<string>('');


    return(
        <Autocomplete
            disablePortal
            options={users}
            onChange={(_, item:IUser|null)=>{
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