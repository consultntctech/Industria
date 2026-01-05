import { IDashboardStats } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { MainDashCardData } from "./MainDashCardData";
import MainDashCard from "./MainDashCard";

type MainDashCardMainComponentProps = {
    stats: IDashboardStats | null | undefined;
    isPending: boolean;
};

const MainDashCardMainComponent = ({ stats, isPending }: MainDashCardMainComponentProps) => {
    const data = MainDashCardData(stats);
  return (
    <div className="flex w-[86vw] sm:w-full flex-col gap-2.5 border border-slate-200 shadow p-4 rounded-xl">
        <div className="flex flex-col gap-5 w-full">
            <span className="semibold">Key Performance Indicators</span>
            
        </div>
        {
            isPending ?
            <LinearProgress className='w-full' />
            :
            <>
                <div className="w-full flex flex-row items-center flex-wrap gap-4 justify-between" >
                    {
                        data?.map((item, index)=>(
                            <MainDashCard key={index} item={item} />
                        ))
                    }
                </div>
            </>
        }
    </div>
  )
}

export default MainDashCardMainComponent