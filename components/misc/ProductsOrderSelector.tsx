import { IProduct } from "@/lib/models/product.model";
import SearchSelectProducts from "../shared/inputs/dropdowns/SearchSelectProducts";
import { ComponentProps, Dispatch, SetStateAction } from "react";
import { twMerge } from "tailwind-merge";
import GenericLabel from "../shared/inputs/GenericLabel";
import SecondaryButton from "../shared/buttons/SecondaryButton";
import { OrderSelectType } from "@/types/Types";
import { enqueueSnackbar } from "notistack";

type ProductsOrderSelectorProps = {
    product: IProduct | null;
    setProduct: Dispatch<SetStateAction<IProduct | null>>;
    quantity: number;
    setProducts: Dispatch<SetStateAction<OrderSelectType[]>>;
    products: OrderSelectType[];
    required: boolean;
} & ComponentProps<'div'>

const ProductsOrderSelector = ({setProduct, product, className, quantity, required, setProducts, products, ...props}: ProductsOrderSelectorProps) => {

const handleAdd = () => {
    if (!product) return;

    const exists = products.some(item => item.product._id === product._id);

    if (exists) {
        enqueueSnackbar('Product already added', { variant: 'error' });
        return;
    }

    const newItem: OrderSelectType = {
        product,
        quantity,
    };

    setProducts(prev => [...prev, newItem]);
};

  return (
    <div className={twMerge('flex flex-row gap-3 bg-white rounded-md p-4 md:p-6 border border-gray-200', className)} {...props} >
        <GenericLabel className="md:w-[43%]" label="Select product" input={<SearchSelectProducts type='Finished Good' value={product} required={required} setSelect={setProduct} />} />
        {
            product &&
            <SecondaryButton type='button' text="Add" onClick={handleAdd} className="w-fit px-2 py-1 self-end text-sm font-light"  />
        }
    </div>
  )
}

export default ProductsOrderSelector