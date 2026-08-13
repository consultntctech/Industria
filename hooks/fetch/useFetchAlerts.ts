import { IAlert } from "@/lib/models/alert.model";
import { useAuth, useCanUser } from "../useAuth";
import { getAlertsByOrg } from "@/lib/actions/alert.action";
import { useQuery } from "@tanstack/react-query";

const ITEM_MODEL_TABLE_MAP: Record<string, string> = {
    Production: '8',
    Order: '86',
    Product: '87',        // Raw Materials — confirm this is right; could be 'Product Types' (28) instead
    RMaterial: '87',
    ProdItem: '12',        // Packaging Materials
    Package: '99',         // Packaging
    LineItem: '44',
    Sales: '82',
    Return: '83',
    Customer: '33',
};

export const useFetchAlerts = () => {
    const { user } = useAuth();
    // const isReader = useCanUser('84', 'READ');

    // Fixed set of checks — one per table that could appear as an alert's itemModel.
    // Hooks must run unconditionally, so this can't be a loop over dynamic values.
    const canReadProduction = useCanUser('8', 'READ');
    const canReadOrder = useCanUser('86', 'READ');
    const canReadRawMaterials = useCanUser('87', 'READ');
    const canReadPackagingMaterials = useCanUser('12', 'READ');
    const canReadPackaging = useCanUser('99', 'READ');
    const canReadLineItem = useCanUser('44', 'READ');
    const canReadSales = useCanUser('82', 'READ');
    const canReadReturns = useCanUser('83', 'READ');
    const canReadCustomers = useCanUser('33', 'READ');

    const permissionsByTableId: Record<string, boolean> = {
        '8': canReadProduction,
        '86': canReadOrder,
        '87': canReadRawMaterials,
        '12': canReadPackagingMaterials,
        '99': canReadPackaging,
        '44': canReadLineItem,
        '82': canReadSales,
        '83': canReadReturns,
        '33': canReadCustomers,
    };

    const fetchAlerts = async (): Promise<IAlert[]> => {
        try {
            if (!user) return [];
            const res = await getAlertsByOrg(user?.org);
            const data = res.payload as IAlert[];

            const filtered = data.filter((alert) => {
                const tableId = ITEM_MODEL_TABLE_MAP[alert.itemModel];
                if (!tableId) return true; // unmapped itemModel → fall back to general Alerts access
                return permissionsByTableId[tableId] ?? false;
            });

            return filtered.sort(
                (a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime()
            );
        } catch (error) {
            console.log(error);
            return [];
        }
    };

    const { refetch, isPending, isSuccess, data: alerts = [] } = useQuery({
        queryKey: ['alerts', user?.org],
        queryFn: fetchAlerts,
        enabled: !!user,
    });

    return { alerts, isPending, refetch, isSuccess };
};