'use client'
import Title from "../misc/Title"
import FinanceComp from "../Views/FinanceComp"

const Finance = () => {
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Finance Overview" isLink={false}/>
        </div>
        <FinanceComp/>
    </div>
  )
}

export default Finance