import { Settings } from '@/config/Settings'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FiLogOut } from 'react-icons/fi'

export const Header = () => {
  const imageLink =  "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";
  return (
    <header style={{backgroundColor:Settings().primaryColour}} className='w-full p-2 flex flex-row justify-between items-center' >
      <Link href='/dashboard'>
        <Image className='rounded-full' src="/images/bird-colorful-gradient-design-vector_343694-2506.jpg" alt="logo" width={30} height={30} />
      </Link>

      <div className="flex flex-row items-center justify-between gap-2 md:gap-6">
        <div className="flex flex-row items-center gap-1 bg-[#66ADE3] px-3 py-1 rounded cursor-pointer">
          <FiLogOut />
          Logout
        </div>
        <Link href='/profile'>
          <Image className='rounded-full' src={imageLink} alt="profile-pic" width={30} height={30} />
        </Link>
      </div>
    </header>
  )
}
