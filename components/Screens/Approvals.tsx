
import ApprovalComp from '../Views/ApprovalComp'
import Title from '../misc/Title'

const Approvals = () => {
  return (

    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Approvals" isLink={false}/>
        </div>
        <ApprovalComp /> 
    </div>
  )
}

export default Approvals