'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import OrderComp from "../Views/OrderComp";
import { IOrder } from "@/lib/models/order.model";
import OrderTable from "../tables/orders/OrderTable";

const Order = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  return (
    <TopContent isLink={false} title="Orders" openNew={openNew} setOpenNew={setOpenNew}>
        <OrderComp  openNew={openNew} setOpenNew={setOpenNew} currentOrder={currentOrder} setCurrentOrder={setCurrentOrder}/>
        <OrderTable setCurrentOrder={setCurrentOrder} currentOrder={currentOrder} setOpenNew={setOpenNew}/>
    </TopContent>
  )
}

export default Order