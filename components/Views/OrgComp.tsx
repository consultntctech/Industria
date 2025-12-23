import  { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel"
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel"
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { IOrganization } from "@/lib/models/org.model";
import { CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Uploader from "../misc/Uploader";
import { enqueueSnackbar } from "notistack";
import { createOrg, updateOrg } from "@/lib/actions/org.action";
import Image from "next/image";
import { useFetchOrgs } from "@/hooks/fetch/useFetchOrgs";

type OrgCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
  currentOrganization:IOrganization | null;
  setCurrentOrganization:Dispatch<SetStateAction<IOrganization | null>>;
}


const OrgComp = ({openNew, setOpenNew, currentOrganization, setCurrentOrganization}:OrgCompProps) => {
  const [logo, setLogo] = useState<{url:string, filename:string}>({url:'', filename:''});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<IOrganization>>({});

  const {refetch} = useFetchOrgs();

  useEffect(() => {
    if(currentOrganization){
      setFormData(currentOrganization);
      setLogo({url:currentOrganization?.logo, filename:''});
    }
  }, [currentOrganization?.logo]);

  const cloudinarySuccess = async(result:CloudinaryUploadWidgetResults) =>{
    try {
        const info = result?.info as CloudinaryUploadWidgetInfo;
        setLogo({url:info.url, filename:info.original_filename});
    } catch (error) {
        console.log(error);
    }
}
  const formRef = useRef<HTMLFormElement>(null);
  const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
    setFormData((pre)=>({
      ...pre, [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setLoading(true);
    const orgData:Partial<IOrganization> = {
      ...formData, pcolor:formData.pcolor === '#000000' ? '#0076D1' : formData.pcolor,
      scolor:formData.scolor === '#000000' ? '#1c80cc' : formData.scolor,
      tcolor:formData.tcolor === '#000000' ? '#005fa3' : formData.tcolor,
      logo: logo.url
    }
    try {
      const res = await createOrg(orgData);
      enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
      if(!res.error){
        formRef.current?.reset();
        refetch();
        handleClose();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while creating organization', {variant:'error'});
    }finally{
      setLoading(false);
    }
  }


  const handleUpdate = async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setLoading(true);

    try {
      const orgData:Partial<IOrganization> = {
        ...formData, logo: logo.url
      }
      const res = await updateOrg(orgData);
      enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
      if(!res.error){
        formRef.current?.reset();
        refetch();
        handleClose();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while updating organization', {variant:'error'});
    }finally{
      setLoading(false);
    }
  }

  const handleClose = () => {
    setOpenNew(false);
    setCurrentOrganization(null);
  }

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={currentOrganization ? handleUpdate : handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >{currentOrganization ? `Edit organization` : `Add new organization`}</span>
          <span className="greyText" >{currentOrganization ? `Edit organization details` : `Create a new organization to manage manufacturing operations`}</span>
        </div>
        {
          logo?.url &&
          <div className="flex w-full justify-center">
            <div className="flex-center w-full">
                <div className="flex-center w-fit bg-slate-300 rounded-full p-2">
                    <div className="h-20 w-20 relative rounded-full">
                        <Image fill className='rounded-full' alt='user' src={logo.url} />
                    </div>
                </div>
            </div>
          </div>
        }

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel defaultValue={currentOrganization?.name} onChange={onChange} name="name" required placeholder="enter name" label="Name" className="w-full" />
            <InputWithLabel defaultValue={currentOrganization?.address} onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
            <InputWithLabel defaultValue={currentOrganization?.phone} onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
            <InputWithLabel defaultValue={currentOrganization?.email} onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
            <InputWithLabel defaultValue={currentOrganization?.website} onChange={onChange} name="website" placeholder="enter URL" label="Website" className="w-full" />
          </div>


          <div className="flex gap-4 flex-col w-full justify-between">
            <div className="flex gap-4 flex-col w-full">
              {/* <InputWithLabel onChange={onChange} name="appName" placeholder="enter a custom name for this app" label="App name" className="w-full" /> */}
              <div className="flex flex-col gap-1">
                <span className="smallText" >Logo</span>
                <Uploader text={logo?.filename ? logo?.filename : 'Upload Image' } onSuccess={cloudinarySuccess} />
              </div>
              {/* <InputWithLabel onChange={onChange} name="logo" type="file" required placeholder="" label="Logo" className="w-full font-bold" /> */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <InputWithLabel defaultValue={currentOrganization?.pcolor} onChange={onChange} name='pcolor' type="color" required placeholder="" label="Primary Color" className="w-full cursor-pointer md:w-[5rem]" />
                <InputWithLabel defaultValue={currentOrganization?.scolor} onChange={onChange} name='scolor' type="color" required placeholder="" label="Secondary Color" className="w-full cursor-pointer md:w-[5rem]" />
                <InputWithLabel defaultValue={currentOrganization?.tcolor} onChange={onChange} name='tcolor' type="color" required placeholder="" label="Tertiary Color" className="w-full cursor-pointer md:w-[5rem]" />
              </div>
              <TextAreaWithLabel defaultValue={currentOrganization?.description} name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
            </div>
            <PrimaryButton loading={loading} type="submit" text={loading?"loading" : currentOrganization ? 'Update' : "Submit"} className="w-full mt-4" />
          </div>
        </div>

        <div className="flex w-fit transition-all hover:bg-gray-100 self-end p-2 rounded-full border border-gray-200 cursor-pointer" onClick={handleClose} >
          <FaChevronUp />
        </div>
      </form>
    </div>
  )
}

export default OrgComp