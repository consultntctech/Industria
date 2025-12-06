import FinanceCard from "../shared/outputs/finance/FinanceCard";
import { FinanceCardsData } from "../shared/outputs/finance/FinanceCardsData"


const FinanceComp = () => {
  const cards = FinanceCardsData();
 
  return (
    <div className="flex flex-col gap-12" >
      <div className="flex gap-6 flex-col w-full">
        <span className="subtitle text-center sm:text-start">Key Financial Metrics</span>
        <div className="flex flex-col sm:flex-row w-fit sm:w-full self-center flex-wrap gap-6">
          {
            cards.map((item, index)=>(
              <FinanceCard key={index} item={item} />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default FinanceComp