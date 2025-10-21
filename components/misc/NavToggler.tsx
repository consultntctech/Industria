import { Dispatch } from 'react'
import {  FaAngleRight } from 'react-icons/fa'

type NavTogglerProps = {
    isOpen: boolean;
    setIsOpen: Dispatch<React.SetStateAction<boolean>>;
}

const NavToggler = ({ isOpen, setIsOpen }: NavTogglerProps) => {
    const handleClick = () => {
        setIsOpen(!isOpen)
    }
  return (
    <div className='border-gray-200 border-1 flex lg:hidden cursor-pointer rounded-full p-1 w-fit absolute right-1' >
        <FaAngleRight className={`text-gray-500 hover:text-black ${isOpen ? 'rotate-180' : ''}`} onClick={handleClick} />
    </div>
  )
}

export default NavToggler