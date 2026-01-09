import { FaChevronUp } from "react-icons/fa"
import ModalContainer from "../ModalContainer"
import { IoIosClose } from "react-icons/io"
import { useEffect, useRef, useState } from "react";
import { IProduction } from "@/lib/models/production.model";
import InputWithLabel from "../../inputs/InputWithLabel";
import PrimaryButton from "../../buttons/PrimaryButton";
import { updateProduction } from "@/lib/actions/production.action";
import { enqueueSnackbar } from "notistack";
import GenericLabel from "../../inputs/GenericLabel";
import { IProduct } from "@/lib/models/product.model";
import SearchSelectBatches from "../../inputs/dropdowns/SearchSelectBatches";
import SearchSelectUsers from "../../inputs/dropdowns/SearchSelectUsers";
import SearchSelectProducts from "../../inputs/dropdowns/SearchSelectProducts";
import { IBatch } from "@/lib/models/batch.model";
import { IUser } from "@/lib/models/user.model";
import { useAuth } from "@/hooks/useAuth";
import { canUser } from "@/Data/roles/permissions";

type InputDetailsModalProps = {
    openNew:boolean;
    setOpenNew: (open:boolean)=>void;
    production:IProduction | null;
}

const InputDetailsModal = ({production, openNew, setOpenNew}:InputDetailsModalProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IProduction>>({});

    const [batch, setBatch] = useState<string>('');
    const [productToProduce, setProductToProduce] = useState<IProduct|null>(null);
    const [supervisor, setSupervisor] = useState<IUser | null>(null);
    const {user} = useAuth();
    const isEditor = canUser(user, '8', 'UPDATE');

    const formRef = useRef<HTMLFormElement>(null);

    const batched = production?.batch as IBatch;
    const productToProd = production?.productToProduce as IProduct;
    const supervisord = production?.supervisor as IUser;


    useEffect(() => {
        if(production){
            setBatch(batched?._id);
            setProductToProduce(productToProd);
            setSupervisor(supervisord);
        }
    }, [production]);

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const updateData:Partial<IProduction> = {
            ...production,
            ...data,
            status: production?.status === 'Completed' ? 'Completed' : 'In Progress',
            id:production?._id,
            batch, supervisor: supervisor?._id, productToProduce: productToProduce?._id
          };
          const res = await updateProduction(updateData);
          enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
              window.location.reload();
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while updating production', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

  return (
     <ModalContainer open={openNew} handleClose={()=>setOpenNew(false)}>
      <div className={`flex w-[90%] md:w-[50%]`}>
        <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full relative" >
            <div className="flex flex-col gap-1">
                <span className="title" >Edit input details</span>
                <span className="greyText" >Edit the primary details of the production</span>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex gap-4 flex-col w-full">
                    <InputWithLabel defaultValue={production?.name} onChange={onChange} name="name" required placeholder="eg. Coffee Production" label="Give it a name" className="w-full" />
                    <GenericLabel
                        label="Select batch"
                        input={<SearchSelectBatches type="Finished Good" value={batched} required={true} setSelect={setBatch} />}
                    />
                    <GenericLabel
                        label="Select supervisor"
                        input={<SearchSelectUsers value={supervisord} required={true} setSelect={setSupervisor} />}
                    />
                </div>
            
                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex flex-col gap-4 w-full">
                        <GenericLabel
                            label="Product to produce"
                            input={<SearchSelectProducts value={productToProd} type="Finished Good" required={true} setSelect={setProductToProduce} />}
                        />
                        <InputWithLabel onChange={onChange} defaultValue={production?.xquantity} name="xquantity" required type="number" min={1} placeholder="10" label="Expected output quantity" className="w-full" />
                    </div>
                    {
                        isEditor &&
                        <PrimaryButton disabled={!isEditor} loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                    }
                </div>
            </div>
    
            <div className="flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
                <IoIosClose className="text-red-700" />
            </div>
            <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
                <FaChevronUp />
            </div>
        </form>
      </div>
    </ModalContainer>
  )
}

export default InputDetailsModal