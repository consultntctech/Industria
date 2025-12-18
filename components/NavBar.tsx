'use client'
import React, { useState } from 'react'
import NavToggler from './misc/NavToggler'
import NavBarContent from './misc/NavBarContent'

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav className='min-h-[100vh] bg-white border-r-1 z-10 border-gray-200 p-4 flex flex-col absolute lg:relative' >
      <NavToggler isOpen={isOpen} setIsOpen={setIsOpen} />
      <NavBarContent isNavOpen={isOpen} />
    </nav>
  )
}
