'use client'

import { useState } from "react";
import TopContent from "../misc/TopContent";
import OrderComp from "../Views/OrderComp";
import { IOrder } from "@/lib/models/order.model";
import OrderTable from "../tables/orders/OrderTable";
import { PermissionGuard } from "@/hooks/permissions/PermissionProvider";
import { useAuth } from "@/hooks/useAuth";
import { canUser } from "@/Data/roles/permissions";

const Order = () => {
    const [openNew, setOpenNew] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
    const {user} = useAuth();
    const isCreator = canUser(user, '86', 'CREATE');
  return (
    <TopContent showAdd={isCreator} isLink={false} title="Orders" openNew={openNew} setOpenNew={setOpenNew}>
      <PermissionGuard tableId={['86']} >
        <OrderComp  openNew={openNew} setOpenNew={setOpenNew} currentOrder={currentOrder} setCurrentOrder={setCurrentOrder}/>
        <OrderTable setCurrentOrder={setCurrentOrder} currentOrder={currentOrder} setOpenNew={setOpenNew}/>
      </PermissionGuard>
    </TopContent>
  )
}

export default Order