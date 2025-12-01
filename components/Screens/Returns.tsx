'use client'

import Title from "../misc/Title"
import ReturnsTable from "../tables/returns/ReturnsTable"

const Returns = () => {

  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Returns" isLink={false}/>
        </div>
        <ReturnsTable/>
    </div>
  )
}

export default Returns