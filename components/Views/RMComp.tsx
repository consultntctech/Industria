import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import GenericLabel from "../shared/inputs/GenericLabel";
import SearchSelectProducts from "../shared/inputs/dropdowns/SearchSelectProducts";
import { FaChevronUp } from "react-icons/fa";
import SearchSelectLtdSuppliers from "../shared/inputs/dropdowns/SearchSelectLtdSuppliers";
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import SearchSelectBatches from "../shared/inputs/dropdowns/SearchSelectBatches";
import { today } from "@/functions/dates";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { enqueueSnackbar } from "notistack";
import { createRMaterial } from "@/lib/actions/rmaterial.action";
import { IProduct } from "@/lib/models/product.model";
import { useAuth } from "@/hooks/useAuth";

type RMCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
}

const RMComp = ({openNew, setOpenNew}:RMCompProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IRMaterial>>({dateReceived:new Date(), qStatus:'Pass', qReceived:0, qRejected:0, charges:0, discount:0});

    const [product, setProduct] = useState<IProduct|null>(null);
    const [supplier, setSupplier] = useState<string>('')
    const [batch, setBatch] = useState<string>('')
    const [showReason, setShowReason] = useState(false);

    const {user} = useAuth();

    const formRef = useRef<HTMLFormElement>(null);



    useEffect(() => {
      if(data?.qRejected && data?.qRejected > 0){
        setShowReason(true);
      }else{
        setShowReason(false);
      }
    }, [data.qRejected])

    useEffect(() => {
      if(product){
        setData((pre)=>({
          ...pre, product: product._id,
          price: (data?.unitPrice! * data.qReceived!) - (data.discount! - data?.charges!),
          qAccepted: data.qReceived! - data.qRejected!
        }))
      } 
    }, [data.qReceived, data.qRejected, data.discount, data.charges, product?.id, data?.unitPrice])

    const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }



    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }));
      };

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const rmData:Partial<IRMaterial> = {
            ...data, product: product?._id, supplier, batch, createdBy:user?._id, org:user?.org
          }
          const res = await createRMaterial(rmData);
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating raw material', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }

  return (
     <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >Add new raw material</span>
          <span className="greyText" >These are the goods you buy for production</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <GenericLabel
              label="Select product"
              input={<SearchSelectProducts type="Raw Material" setSelect={setProduct} required={true} />}
            />
            <GenericLabel
            label="Select supplier"
            input={<SearchSelectLtdSuppliers required setSelect={setSupplier} productId={product?._id || ''} />}
            />
            <GenericLabel 
              label='Select batch'
              input={
                <SearchSelectBatches type="Raw Material" required setSelect={setBatch} />
              }
            />
            <GenericLabel 
                label='Select quality status'
                input={
                <select onChange={onSelectChange} name="qStatus" className={`outline-none border-1 border-gray-300 rounded px-4 py-1`}  >
                    <option  value="Pass">Pass</option>
                    <option value="Partial">Partial</option>
                    <option value="Fail">Fail</option>
                </select>
                }
            />
            <InputWithLabel onChange={onChange} name="yield"  type="number" min={1} placeholder="eg. 2" label="Expected yield rate" className="w-full" />
            <InputWithLabel onChange={onChange} max={today()} name="dateReceived" defaultValue={today()} type="date" required label="Date received" className="w-full" />
            <InputWithLabel onChange={onChange} name="unitPrice"  type="number" min={1} placeholder="eg. 25" label="Enter unit price" className="w-full" />
            <InputWithLabel onChange={onChange} name="qReceived" required type="number" min={0} placeholder="eg. 1000" label="Quantity received" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full justify-between">
            <div className="flex flex-col gap-4 w-full">
            <InputWithLabel onChange={onChange} defaultValue={0} name="qRejected" type="number" min={0} placeholder="eg. 50" label="Quantity rejected" className="w-full" />
              {
                  showReason &&
                  <TextAreaWithLabel name="reason" onChange={onChange} placeholder="enter reason for rejection (if any)" label="Reason for rejection" className="w-full" />
              }
              <InputWithLabel onChange={onChange} name="charges"  type="number" min={0} placeholder="eg. 20" label="Addtional Charges" className="w-full" />
              <InputWithLabel onChange={onChange} name="discount"  type="number" min={0} placeholder="eg. 20" label="Discount" className="w-full" />
              <InputWithLabel readOnly defaultValue={data?.price} name="price"  type="number"  label="Total cost" className="w-full" />
              <TextAreaWithLabel name="note" onChange={onChange} placeholder="enter note" label="Note" className="w-full" />
            </div>
            <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
          </div>
        </div>

        <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={()=>setOpenNew(false)} >
          <FaChevronUp />
        </div>
      </form>
    </div>
  )
}

export default RMComp