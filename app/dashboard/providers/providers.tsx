'use client';
import { ReactNode } from "react";
import {  QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { usePermissions } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";

// const queryClient = new QueryClient();

export const PermissionBootStrap = () => {
    usePermissions();
    return null;
};

export default function Providers({children}:{children:ReactNode}) {
    return (
        <QueryClientProvider client={queryClient}>
            <PermissionBootStrap/>
            {children}
        </QueryClientProvider>
    )
}


export function SnackProvider({children}:{children:ReactNode}) {
    return (
        <SnackbarProvider maxSnack={3} anchorOrigin={{vertical:'top', horizontal:'right'}} >
            {children}
        </SnackbarProvider>
    )
}