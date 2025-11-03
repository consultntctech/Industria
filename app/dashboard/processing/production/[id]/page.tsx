import SingleProduction from '@/components/Screens/SingleProduction'
import { getProduction } from '@/lib/actions/production.action';
import { IProduction } from '@/lib/models/production.model';
import React from 'react'

const page = async({params}:{params:Promise<{id:string}>}) => {
    const {id} = await params;
    const res = await getProduction(id);
    const production = res?.payload as IProduction;
  return (
    <SingleProduction production={production} />
  )
}

export default page