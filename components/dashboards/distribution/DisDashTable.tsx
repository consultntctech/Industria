import PackageMiniTable from "./distminitable/PackagesMiniTable"

const DisDashTable = () => {
  return (
    <div className="flex flex-col gap-4 p-2.5 shadow border border-slate-200 flex-1 rounded-2xl" >
        <span className="semibold">Recent Packaging Activities</span>
        <PackageMiniTable />
    </div>
  )
}

export default DisDashTable