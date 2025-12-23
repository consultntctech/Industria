import { CardProps, IProductionStats } from "@/types/Types"
import { FiPercent } from "react-icons/fi"
import { MdNumbers } from "react-icons/md"

export const ProductionCardData = (stats:IProductionStats | null | undefined):Partial<CardProps>[] => {
  return [
    {
      title: "Production Input",
      titleIcon: <MdNumbers />,
      centerText: `${stats?.input?.toString() || 0}`,
      bottomText: "Total Production Input",
    },
    {
      title: "Production Output",
      titleIcon: <MdNumbers />,
      centerText: `${stats?.output?.toString() || 0}`,
      bottomText: "Total Production Output",
    },
    {
      title: "Efficiency",
      titleIcon: <FiPercent />,
      centerText: `${Math.round(stats?.efficiencyPercent || 0)}%`,
      bottomText: "Efficiency of Productions"
    },
    {
      title: "Material Loss",
      titleIcon: <FiPercent />,
      centerText: `${Math.round(stats?.lossPercent || 0)}%`,
      bottomText: "Loss of Productions"
    }
  ]
}