import { Dispatch, Fragment, SetStateAction, useState } from "react"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, Chip, CircularProgress, TextField } from "@mui/material";
import { IProduct } from "@/lib/models/product.model";
import { IGood } from "@/lib/models/good.model";
import { useFetchGoodsWithRawMaterialsByOrgAndBatch } from "@/hooks/fetch/useFetchGoods";


type SearchSelectMultipleGoodsWithRMProps = {
    setSelection:Dispatch<SetStateAction<IGood[]>>;
    batchId:string;
    // selection:string[];
    // fixedSelection?:ISupplier[];
    width?:number;
    required?:boolean;
    value?:IGood[];
    disabled?:boolean;
} 

const SearchSelectMultipleGoodsWithRM = ({setSelection, batchId,  width, required, value=[], disabled}:SearchSelectMultipleGoodsWithRMProps) => {
    const [search, setSearch] = useState<string>('');
    const {goods, isPending} = useFetchGoodsWithRawMaterialsByOrgAndBatch(batchId);
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <Autocomplete
        disabled={disabled}
        disableCloseOnSelect
        multiple
        filterSelectedOptions
        defaultValue={value || []}
        options={goods}
        onChange={(_, items:IGood[])=>{
            // const fixed = fixedSelection ?? [];
            // const uniqueSelection = items.filter(
            //     (option)=>!fixed.some((item)=>item._id === option._id)
            // )
            if(setSelection){
                setSelection(items);
            }
          
        }}

        inputValue={search}
        onInputChange={(_, v)=>setSearch(v)}
        // value={selection ?? []}
        loading={isPending && !!batchId}
        isOptionEqualToValue={(option, v)=>option._id === v._id}
        getOptionLabel={(option)=>{
            const product = option?.product as IProduct;
            return `${product?.name} - ${option?.serialName}`;
        }}
        sx ={{width:width || '100%'}}

        renderValue={(tagValue, getTagProps)=>
            tagValue.map((option, index) => {
                const product = option?.product as IProduct;
                const {key, ...tagProps} = getTagProps({index});

                return(
                    <Chip
                        {...tagProps}
                        key={key}
                        label={`${product?.name} - ${option?.serialName}`}
                        // disabled={!!fixedSelection?.find((item)=>item._id === option._id)}
                    />
                )
            })
        }

        renderOption={(props, option, {selected}) =>{
            const {key, ...optionProps} = props;
            const product = option?.product as IProduct;

            return(
                <li key={key} {...optionProps} >
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        style = {{marginRight:8}}
                    />
                    {`${product?.name} - ${option?.serialName}`}
                </li>
            );
        }}

        renderInput={(params)=>(
            <TextField
                {...params}
                required={required}
                size="small"
                label= "Raw Materials"
                color="primary"
                // defaultValue={value}
                className="rounded"
                slotProps={{
                    input:{
                        ...params.InputProps,
                        endAdornment:(
                            <Fragment>
                                {(isPending && !!batchId) ? <CircularProgress size={20} color="inherit" />: null}
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

export default SearchSelectMultipleGoodsWithRM