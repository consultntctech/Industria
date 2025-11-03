'use client'
import BatchConfigComp from '../Views/BatchConfigComp';
// import { IoMdAddCircle } from 'react-icons/io';
import Title from '../misc/Title';
// import { useSettings } from '@/config/useSettings';

const BatchConfig = () => {
//    const [openNew, setOpenNew] = useState(false);
    // const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Batch-no Configuration" isLink={false}/>
            {/* <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} /> */}
        </div>
        <BatchConfigComp />
    </div>
  )
}

export default BatchConfig