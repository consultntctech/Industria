'use client'
import  { useState } from 'react'
import Title from '../misc/Title'
import { IoMdAddCircle } from 'react-icons/io'
import ProdCatComp from '../Views/ProdCatComp';
import { useSettings } from '@/config/useSettings';
import { ICategory } from '@/lib/models/category.model';
import CategoryTable from '../tables/categories/CategoryTable';

const ProductCats = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<ICategory | null>(null);
    const {primaryColour} = useSettings();
  return (
    <div className="flex w-full flex-col gap-8 ml-4 md:ml-4">
        <div className="flex w-full items-center flex-row justify-between">
            <Title title="Categories" isLink={false}/>
            <IoMdAddCircle onClick={()=>setOpenNew(true)} style={{color:primaryColour}} size={30} className={`${openNew ? 'hidden':'block'} cursor-pointer`} />
        </div>
        <ProdCatComp openNew={openNew} setOpenNew={setOpenNew} currentCategory={currentCategory} setCurrentCategory={setCurrentCategory} />
        <CategoryTable setCurrentCategory={setCurrentCategory} currentCategory={currentCategory} setOpenNew={setOpenNew} />
    </div>
  )
}

export default ProductCats