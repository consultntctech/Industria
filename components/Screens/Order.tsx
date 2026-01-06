'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import OrderComp from "../Views/OrderComp";
import { IOrder } from "@/lib/models/order.model";
import OrderTable from "../tables/orders/OrderTable";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";

const Order = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  return (
    <TopContent isLink={false} title="Orders" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['86']} >
        <OrderComp  openNew={openNew} setOpenNew={setOpenNew} currentOrder={currentOrder} setCurrentOrder={setCurrentOrder}/>
        <OrderTable setCurrentOrder={setCurrentOrder} currentOrder={currentOrder} setOpenNew={setOpenNew}/>
      </PermissionGuard>
    </TopContent>
  )
}

export default Order