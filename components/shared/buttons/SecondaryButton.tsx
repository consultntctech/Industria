'use client'
import LoadingDots from '@/components/misc/LoadingDots';
import { useSettings } from '@/config/useSettings';
import  { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge';

type SecondaryButtonProps = {
    text:string;
    loading?:boolean
    textClassName?:string;
} & ComponentProps<'button'>

const SecondaryButton = ({text, loading, textClassName, className, ...props}: SecondaryButtonProps) => {
  const {tertiaryColour, secondaryColour, isSuccess} = useSettings();
  if(!isSuccess || !secondaryColour || !tertiaryColour) return null;
  return (
    <button
        disabled={loading}
        style={{backgroundColor:loading? tertiaryColour:secondaryColour}}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tertiaryColour)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = secondaryColour)} 
        className={twMerge(`cursor-pointer text-white font-semibold rounded p-1`, className)} {...props} >
        <LoadingDots loading={loading} text={text} className={textClassName} />
    </button>
  )
}

export default SecondaryButton