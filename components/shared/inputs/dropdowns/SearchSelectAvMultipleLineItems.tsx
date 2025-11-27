import { Dispatch, Fragment, SetStateAction, useState } from "react"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, Chip, CircularProgress, TextField } from "@mui/material";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IBatch } from "@/lib/models/batch.model";


type SearchSelectAvMultipleLineItemsProps = {
    setSelection:Dispatch<SetStateAction<ILineItem[]>>;
    selection: ILineItem[];
    items: ILineItem[];
    isPending: boolean;
    productId: string;
    width?:number;
    required?:boolean;
    // value?:ILineItem[];
}

const SearchSelectAvMultipleLineItems = ({setSelection, selection, items, isPending, productId, width, required}:SearchSelectAvMultipleLineItemsProps) => {
    const [search, setSearch] = useState<string>('');
    
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    // console.log('IDS: ',proditems.map((item)=>item._id))

  return (
    <Autocomplete
        disableCloseOnSelect
        multiple
        filterSelectedOptions
        value={selection}
        
        options={items}
        onChange={(_, items:ILineItem[])=>{
            // const fixed = fixedSelection ?? [];
            // const uniqueSelection = items.filter(
            //     (option)=>!fixed.some((item)=>item._id === option._id)
            // )
            // const ids = items.map(item=>item._id)
            // setSelection([...fixed, ...uniqueSelection]);
            setSelection(items);
        }}

        inputValue={search}
        onInputChange={(_, v)=>setSearch(v)}
        // value={selection ?? []}
        loading={!!productId && isPending}
        isOptionEqualToValue={(option, v)=>option._id === v._id}
        getOptionLabel={(option)=>{
            const batch = option?.batch as IBatch;
            return `${option?.serialNumber || option?.name} (${batch?.code})`
        }}
        sx ={{width:width || '100%'}}

        renderValue={(tagValue, getTagProps)=>
            tagValue.map((option, index) => {
                const {key, ...tagProps} = getTagProps({index});
                const batch = option?.batch as IBatch;
                const label = `${option?.serialNumber || option?.name} (${batch?.code})`

                return(
                    <Chip
                        {...tagProps}
                        key={key}
                        label={label}
                        // disabled={!!fixedSelection?.find((item)=>item._id === option._id)}
                    />
                )
            })
        }

        renderOption={(props, option, {selected}) =>{
            const {key, ...optionProps} = props;
            const batch = option?.batch as IBatch;

            return(
                <li key={key} {...optionProps} >
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        style = {{marginRight:8}}
                    />
                    {`${option?.serialNumber || option?.name} (${batch?.code})`}
                </li>
            );
        }}

        renderInput={(params)=>(
            <TextField
                {...params}
                required={required}
                size="small"
                label= "line items"
                color="primary"
                // defaultValue={value}
                className="rounded"
                slotProps={{
                    input:{
                        ...params.InputProps,
                        endAdornment:(
                            <Fragment>
                                {(!!productId && isPending) ? <CircularProgress size={20} color="inherit" />: null}
                                {params.InputProps.endAdornment}
                            </Fragment>
                        )
                    }
                }}
            />
        )}
    />
  )
}

export default SearchSelectAvMultipleLineItems