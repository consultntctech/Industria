import React, { ChangeEvent, Dispatch, FormEvent, SetStateAction, useRef, useState } from 'react'
import InputWithLabel from '../shared/inputs/InputWithLabel';
import { FaChevronUp } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import TextAreaWithLabel from '../shared/inputs/TextAreaWithLabel';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { createUser } from '@/lib/actions/user.action';
import { IUser } from '@/lib/models/user.model';


type UserCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
}

const UsersComp = ({openNew, setOpenNew}:UserCompProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<IUser>>({});


    const formRef = useRef<HTMLFormElement>(null);
      const onChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setFormData((pre)=>({
          ...pre, [e.target.name]: e.target.value
        }))
    }


     const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        
        try {
          const res = await createUser(formData);
          enqueueSnackbar(res.message, {variant:res.error ? 'error':'success'});
          if(!res.error){
              formRef.current?.reset();
              setOpenNew(false);
          }
        } catch (error) {
          console.log(error);
          enqueueSnackbar('Error occured while creating user', {variant:'error'});
        }finally{
          setLoading(false);
        }
    }


  return (
     <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      
      <form ref={formRef} onSubmit={handleSubmit}  className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >Add new user</span>
          <span className="greyText" >Create a new user to handle operations</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel onChange={onChange} name="name" required placeholder="enter name" label="Name" className="w-full" />
            <InputWithLabel onChange={onChange} name="address" required placeholder="enter address" label="Address" className="w-full" />
            <InputWithLabel onChange={onChange} name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
            <InputWithLabel onChange={onChange} name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full justify-between">
            
            
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

export default UsersComp