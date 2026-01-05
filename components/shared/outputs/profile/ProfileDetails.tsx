import { useFetchUserProfile } from "@/hooks/fetch/useFetchUsers";
import { LinearProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import InputWithLabel from "../../inputs/InputWithLabel";
import { IUser } from "@/lib/models/user.model";
import TextAreaWithLabel from "../../inputs/TextAreaWithLabel";
import PrimaryButton from "../../buttons/PrimaryButton";
import { CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import Uploader from "@/components/misc/Uploader";
import { updateUserV2 } from "@/lib/actions/user.action";
import { enqueueSnackbar } from "notistack";
import { ISession } from "@/types/Types";
import { createSession } from "@/lib/session";

const ProfileDetails = () => {
    const {userProfile, isPending, refetch} = useFetchUserProfile();
    const formRef = useRef<HTMLFormElement>(null);

    const [data, setData] = useState<Partial<IUser>>({});
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<{url:string, filename:string}>({url:'', filename:''});



    useEffect(() => {
        if(userProfile){
            setData(userProfile);
            setLogo({url:userProfile?.photo, filename:''});
        }
    }, [userProfile?.photo]);

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        try {
            if(!userProfile) return;
            const updatedData:Partial<IUser> = {...data, photo:logo.url};
            const res = await updateUserV2(updatedData);
            const session = res.payload as ISession;
            await createSession(session);
            enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                refetch();
            }
        }catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while updating user data', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

    const cloudinarySuccess = async(result:CloudinaryUploadWidgetResults) =>{
        try {
            const info = result?.info as CloudinaryUploadWidgetInfo;
            setLogo({url:info.url, filename:info.original_filename});
        } catch (error) {
            console.log(error);
        }
    }

  const onChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setData((pre)=>({
            ...pre, [e.target.name]: e.target.value
        }))
  }

  return (
     <div className={`flex rounded-2xl w-full`} >
          
          <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
            <div className="flex flex-col gap-1">
              <span className="title" >Edit Profile information</span>
              <span className="greyText" >Some fields can only be edited by your organization</span>
            </div>
            {
                isPending ?
                <LinearProgress className='w-full' />
                :

                <>
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
                        <InputWithLabel defaultValue={userProfile?.name} readOnly onChange={onChange} name="name" required placeholder="enter name" label="Name" className="w-full" />
                        <InputWithLabel defaultValue={userProfile?.address} onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
                        <InputWithLabel defaultValue={userProfile?.phone} onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
                        <InputWithLabel defaultValue={userProfile?.email} readOnly onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
                    </div>
            
                    <div className="flex gap-4 flex-col w-full justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="smallText" >Profile picture</span>
                            <Uploader text={logo?.filename ? logo?.filename : 'Upload Image' } onSuccess={cloudinarySuccess} />
                        </div>
                        <TextAreaWithLabel defaultValue={userProfile?.description} readOnly name="description" onChange={onChange} placeholder="enter description" label="Description" className="w-full" />
                        <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Update"} className="w-full mt-4" />
                    </div>
                    </div>
                </>
            }
    
            
          </form>
        </div>
  )
}

export default ProfileDetails