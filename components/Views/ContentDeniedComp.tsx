// import { LinearProgress } from "@mui/material"

// type ContentDeniedCompProps={
//   isLoading:boolean,
//   canAccess:boolean
// }
const ContentDeniedComp = () => {
    
  return (
    <div className={`flex p-4 lg:p-8 rounded-2xl w-full`}>
        <div  className="formBox p-4 flex-col gap-4 w-full h-[50vh] justify-center items-center" >
            <span className="title text-red-600" >Access Denied</span>
            <span className="text-2xl" >You do not have permission to access this content</span>
        </div>
    </div>
  )
}

export default ContentDeniedComp