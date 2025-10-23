'use client'
import { useSettings } from '@/config/useSettings'
import { useAuth } from '@/hooks/useAuth'
import { destroySession } from '@/lib/session'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FiLogOut } from 'react-icons/fi'

export const Header = () => {
  const imageLink =  "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";

  const {primaryColour, appName, tertiaryColour, logo, isPending} = useSettings();
  const {user} = useAuth();

  if(isPending) return null

  return (
    <header style={{backgroundColor:primaryColour}} className='w-full p-2 flex flex-row justify-between items-center' >
      <Link className='flex flex-row gap-2' href='/dashboard'>
        <Image className='rounded-full' src={logo} alt="logo" width={35} height={30} />
        <span className='title text-white' >{appName}</span>
      </Link>

      <div className="flex flex-row items-center justify-between gap-2 md:gap-6">
        <div style={{backgroundColor:tertiaryColour || '#66ADE3'}} onClick={destroySession} className="flex flex-row text-white items-center gap-1 px-3 py-1 rounded cursor-pointer">
          <FiLogOut />
          Logout
        </div>
        <Link href='/profile'>
          <Image className='rounded-full' src={user?.photo || imageLink} alt="profile-pic" width={30} height={30} />
        </Link>
      </div>
    </header>
  )
}
