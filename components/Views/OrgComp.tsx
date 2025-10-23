import React, { ChangeEvent, Dispatch, FormEvent, SetStateAction, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel"
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel"
import { FaChevronUp } from "react-icons/fa";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import { IOrganization } from "@/lib/models/org.model";
import { CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Uploader from "../misc/Uploader";
import { enqueueSnackbar } from "notistack";
import { createOrg } from "@/lib/actions/org.action";

type OrgCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
}


const OrgComp = ({openNew, setOpenNew}:OrgCompProps) => {
  const [logo, setLogo] = useState<{url:string, filename:string}>({url:'', filename:''});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<IOrganization>>({});

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
      ...formData, pcolor:formData.pcolor === '#000000' ? '' : formData.pcolor,
      scolor:formData.scolor === '#000000' ? '' : formData.scolor,
      tcolor:formData.tcolor === '#000000' ? '' : formData.tcolor,
      logo: logo.url
    }
    try {
      const res = await createOrg(orgData);
      enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
      if(!res.error){
        formRef.current?.reset();
        setOpenNew(false);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while creating organization', {variant:'error'});
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >Add new organization</span>
          <span className="greyText" >Create a new organization to manage manufacturing operations</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel onChange={onChange} name="name" required placeholder="enter name" label="Name" className="w-full" />
            <InputWithLabel onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
            <InputWithLabel onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
            <InputWithLabel onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
            <InputWithLabel onChange={onChange} name="website" placeholder="enter URL" label="Website" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full">
            {/* <InputWithLabel onChange={onChange} name="appName" placeholder="enter a custom name for this app" label="App name" className="w-full" /> */}
            <div className="flex flex-col gap-1">
              <span className="smallText" >Logo</span>
              <Uploader text={logo?.filename ? logo?.filename : 'Upload Image' } onSuccess={cloudinarySuccess} />
            </div>
            {/* <InputWithLabel onChange={onChange} name="logo" type="file" required placeholder="" label="Logo" className="w-full font-bold" /> */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <InputWithLabel onChange={onChange} name='pcolor' type="color" required placeholder="" label="Primary Color" className="w-full cursor-pointer md:w-[5rem]" />
              <InputWithLabel onChange={onChange} name='scolor' type="color" required placeholder="" label="Secondary Color" className="w-full cursor-pointer md:w-[5rem]" />
              <InputWithLabel onChange={onChange} name='tcolor' type="color" required placeholder="" label="Tertiary Color" className="w-full cursor-pointer md:w-[5rem]" />
            </div>
            <TextAreaWithLabel name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
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

export default OrgComp