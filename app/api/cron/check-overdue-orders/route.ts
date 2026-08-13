import { checkOverdueOrders } from "@/lib/actions/order.action";
import { NextResponse } from "next/server";

export async function GET(request:Request){
    try {
        const authHeader = request.headers.get('Authorization');
        if(authHeader !== `Bearer ${process.env.CRON_SECRET}`){
            return new NextResponse('Unauthorized', {status:401});
        }
        const res = await checkOverdueOrders();
        return NextResponse.json(res);
    } catch (error) {
        console.log(error);
        return NextResponse.json({success:false, message:'Cron failed'}, {status:500});
    }
}