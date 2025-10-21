import React, { Dispatch, SetStateAction } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel"
import TextAreaWithLabel from "../shared/inputs/TextAreaWithLabel"
import { FaChevronUp } from "react-icons/fa";

type OrgCompProps = {
  openNew:boolean;
  setOpenNew: Dispatch<SetStateAction<boolean>>;
}

const OrgComp = ({openNew, setOpenNew}:OrgCompProps) => {
  return (
    <div className={`${openNew? 'flex':'hidden'} p-4 lg:p-8 rounded-2xl w-full`} >
      <form className="formBox p-4 flex-col gap-8 w-full" >
        <div className="flex flex-col gap-1">
          <span className="title" >Add new organization</span>
          <span className="greyText" >Create a new organization to manage manufacturing operations</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel name="name" required placeholder="enter name" label="Name" className="w-full" />
            <InputWithLabel name="address" required placeholder="enter address" label="Address" className="w-full" />
            <InputWithLabel name="phone" required placeholder="enter phone" label="Phone" className="w-full" />
            <InputWithLabel name="email" required type="email" placeholder="enter email" label="Email" className="w-full" />
          </div>

          <div className="flex gap-4 flex-col w-full">
            <InputWithLabel name="website" placeholder="enter URL" label="Website" className="w-full" />
            <InputWithLabel name="logo" type="file" required placeholder="" label="Logo" className="w-full font-bold" />
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <InputWithLabel name='pcolor' type="color" required placeholder="" label="Primary Color" className="w-full cursor-pointer md:w-[5rem]" />
              <InputWithLabel name='scolor' type="color" required placeholder="" label="Secondary Color" className="w-full cursor-pointer md:w-[5rem]" />
              <InputWithLabel name='tcolor' type="color" required placeholder="" label="Tertiary Color" className="w-full cursor-pointer md:w-[5rem]" />
            </div>
            <TextAreaWithLabel name="description" required placeholder="enter description" label="Description" className="w-full" />
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