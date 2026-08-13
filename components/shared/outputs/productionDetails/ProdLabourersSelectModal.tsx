import { IProduction } from "@/lib/models/production.model";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ModalContainer from "../ModalContainer";
import PrimaryButton from "../../buttons/PrimaryButton";
import { useCanUser } from "@/hooks/useAuth";
import { IoIosClose } from "react-icons/io";
import { FaChevronUp } from "react-icons/fa";
import { updateProduction } from "@/lib/actions/production.action";
import { enqueueSnackbar } from "notistack";
import GenericLabel from "../../inputs/GenericLabel";
import { ILabourer } from "@/lib/models/labourer.model";
import SearchSelectMultipleLabourers from "../../inputs/dropdowns/SearchSelectMultipleLabourers";

type ProdLabourersSelectModalProps = {
    openLab:boolean;
    setOpenLab: Dispatch<SetStateAction<boolean>>;
    production: IProduction | null;
}

const ProdLabourersSelectModal = ({ openLab, setOpenLab, production }: ProdLabourersSelectModalProps) => {
    const [loading, setLoading] = useState(false);
    const [labourers, setLabourers] = useState<ILabourer[]>([]);
    const isEditor = useCanUser('8', 'UPDATE');
    const labs = production?.labourers as ILabourer[];

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(()=>{
        if(production){
            setLabourers(labs);
        }
    }, [production])

    const handleClose = ()=>{
        setOpenLab(false);
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
            const prodData:Partial<IProduction> = {
                ...production,
                labourers: labourers.map(lab=>lab._id),
            }
           const res = await updateProduction(prodData);
           enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
           if(!res.error){
               formRef.current?.reset();
               handleClose();
               window.location.reload();
           }
         } catch (error) {
           console.log(error);
           enqueueSnackbar('Error occured while updating labourers production', {variant:'error'});
         }finally{
           setLoading(false);
         }
     }

  return (
    <ModalContainer  open={openLab} handleClose={handleClose}>
        <div className="flex w-[90%] md:w-[50%] max-h-[95%]">
            <form ref={formRef} onSubmit={ handleSubmit}  className="formBox overflow-y-scroll scrollbar-custom  h-full relative p-4 flex-col gap-8 w-full" >
                <div className="flex flex-col gap-1">
                    <span className="title" >Edit production labourers</span>
                    <span className="greyText" >You cannot edit the production after submitting for approval.</span>
                </div>
        
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex gap-4 flex-col w-full">
                        <div className="flex flex-col gap-4 w-full">
                            {
                               openLab &&
                                <>
                                    <GenericLabel
                                        label="Select labourers"
                                        input={<SearchSelectMultipleLabourers placeholder="labourers" value={labs} setSelection={setLabourers} />}
                                    />
                                    
                                </>
                            }
                            
                        </div>
                        {
                            isEditor &&
                            <PrimaryButton disabled={!isEditor} loading={loading} type="submit" text={loading?"loading" : "Submit"} className="w-full mt-4" />
                        }
                    </div>

                </div>
        
                <div className="flex w-fit transition-all absolute top-1 right-1 hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <IoIosClose className="text-red-700" />
                </div>
                <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
                    <FaChevronUp />
                </div>
            </form>
        </div>
    </ModalContainer>
  )
}

export default ProdLabourersSelectModal