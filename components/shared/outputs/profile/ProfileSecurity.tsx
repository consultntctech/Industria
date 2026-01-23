
import {  useRef, useState } from "react";
import InputWithLabel from "../../inputs/InputWithLabel";
import { IUser } from "@/lib/models/user.model";
import PrimaryButton from "../../buttons/PrimaryButton";

import { changePassword } from "@/lib/actions/user.action";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "@/hooks/useAuth";
import { PasswordProps } from "@/components/Views/ResetComp";
import { validatePasswordReset } from "@/functions/helpers";

const ProfileSecurity = () => {
    const formRef = useRef<HTMLFormElement>(null);

    const [data, setData] = useState<PasswordProps>({password:'', password1:''});
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();



    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        try {
            if(!user) return;
            const valid = validatePasswordReset(data?.password, data?.password1)
            if(valid.error){
                enqueueSnackbar(valid.message, {variant:'error'});
                return
            }
            const updatedData = {...user, password:data?.password} as unknown as Partial<IUser>;
            const res = await changePassword(updatedData);
            enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
            if(!res.error){
                formRef.current?.reset();
            }
        }catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while updating user data', {variant:'error'});
        }finally{
            setLoading(false);
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
              <span className="title" >Change Account Password</span>
              <span className="greyText" >Set a new password to access your Industra account</span>
            </div>
         

                <div className="flex gap-4 flex-col w-full justify-between">
                    <div className="flex gap-4 flex-col w-full">
                        <InputWithLabel type="password"  onChange={onChange} name="password" required placeholder="enter password" label="New Password" className="w-full" />
                        <InputWithLabel type="password"  onChange={onChange} name="password1" required placeholder="confirm password" label="Confirm New Password" className="w-full" />
                    </div>
                    <PrimaryButton loading={loading} type="submit" text={loading?"loading" : "Update"} className="w-full mt-4" />
                </div>
                
          </form>
        </div>
  )
}

export default ProfileSecurity