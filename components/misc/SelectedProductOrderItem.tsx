import { IProduct } from "@/lib/models/product.model";
import { OrderSelectType } from "@/types/Types";
import { ChangeEvent, ComponentProps, Dispatch, SetStateAction } from "react";
import { FiMinusCircle } from "react-icons/fi";
import { GoPlusCircle } from "react-icons/go";
import { MdOutlineCancel } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type SelectedProductOrderItemProps = {
    product: IProduct | null;
    quantity: number;
    products: OrderSelectType[];
    setProducts: Dispatch<SetStateAction<OrderSelectType[]>>;
    setQuantity: Dispatch<SetStateAction<number>>;
} & ComponentProps<'div'>

const SelectedProductOrderItem = ({product, quantity, setProducts, products, setQuantity, className, ...props}: SelectedProductOrderItemProps) => {
    const handleAdd = () => {
        setProducts(prev => prev.map(item => item.product._id === product?._id ? { ...item, quantity:quantity+1 } : item));
    };

    const handleMinus = () => {
        setProducts(prev => prev.map(item => item.product._id === product?._id ? { ...item, quantity:quantity-1 } : item).filter(item => item.quantity > 0));
    };
    const handleRemove = () => {
        setProducts(prev => prev.filter(item => item.product._id !== product?._id));
    };

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        setProducts(prev => prev.map(item => item.product._id === product?._id ? { ...item, quantity:Number(e.target.value) } : item));
    };

  return (
    <div {...props}  className={twMerge('rounded-md flex items-center p-2 bg-white/10 border border-gray-200 gap-4', className)} >
        <span className="greyText" >{product?.name}</span>
        <div className="flex items-center gap-2">
            <FiMinusCircle onClick={handleMinus} size={20} className="text-gray-400 hover:text-gray-500 cursor-pointer" />
            {/* <span className="mlabel" >{quantity}</span> */}
            <input step={0.0001} onChange={handleChange} type="number" value={quantity}  className="w-8 outline-none text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <GoPlusCircle onClick={handleAdd} size={20} className="text-gray-400 hover:text-gray-500 cursor-pointer" />
            <MdOutlineCancel onClick={handleRemove} size={20} className="text-red-400 hover:text-red-500 cursor-pointer" />
        </div>
    </div>
  )
}

export default SelectedProductOrderItem