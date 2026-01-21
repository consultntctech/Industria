import Link from "next/link"

export const Footer = () => {
  return (
    <footer className="border-t border-slate-300 p-4 w-full flex-center" >
      <div className="flex-center gap-2 flex-row">
        <span className="font-extralight" >&copy;</span>
        <span className="font-extralight" >{new Date()?.getFullYear()}</span>
        <Link className="font-extralight underline" target="_blank" href="https://www.consultntctech.com/">NTC Tech</Link>
      </div>
    </footer>
  )
}
