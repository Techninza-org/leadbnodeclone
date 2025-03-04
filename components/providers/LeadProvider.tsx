"use client"

import { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { APIError, useMutation, useQuery } from 'graphql-hooks';
import { useAtomValue, useSetAtom } from 'jotai';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { leadSchema } from '@/types/lead';
import { clients, leads, prospects } from '@/lib/atom/leadAtom';
import { leadQueries } from '@/lib/graphql/lead/queries';
import { userAtom } from '@/lib/atom/userAtom';
import { leadMutation } from '@/lib/graphql/lead/mutation';
import { LOGIN_USER } from '@/lib/graphql/user/mutations';

interface LeadProviderType {
    handleCreateLead: ({ lead, error }: { lead: z.infer<typeof leadSchema>, error?: APIError<object> | undefined }) => void;
    handleCreateBulkLead: ({ lead, error }: { lead: z.infer<typeof leadSchema>, error?: APIError<object> | undefined }) => void;
}

const LeadContext = createContext<LeadProviderType | undefined>(undefined);

export const LeadProvider = ({ children }: { children: ReactNode }) => {
    const userInfo = useAtomValue(userAtom);
    const { toast } = useToast();
    const setLeads = useSetAtom(leads);
    const setClients = useSetAtom(clients);
    const setProspect = useSetAtom(prospects);

    // Only skip if user has ROOT/MANAGER role but no companyId
    const shouldSkipQuery = () => {
        const isValidRole = ['ROOT', 'MANAGER'].includes(userInfo?.role?.name || "");
        const hasCompanyId = !!userInfo?.companyId;
        return isValidRole && !hasCompanyId;
    };

    const { loading: leadsLoading } = useQuery(
        leadQueries.GET_COMPANY_LEADS,
        {
            variables: { companyId: userInfo?.companyId },
            skip: shouldSkipQuery(),
            onSuccess: ({ data }) => {
                if (data?.getCompanyLeads?.lead) {
                    setLeads(data.getCompanyLeads.lead);
                }
            },
            onError: (error: any) => {
                console.error('Leads query error:', error);
            },
            refetchAfterMutations: [
                { mutation: LOGIN_USER },
                { mutation: leadMutation.LEAD_ASSIGN_TO },
                { mutation: leadMutation.CREATE_LEAD },
                { mutation: leadMutation.APPROVED_LEAD_MUTATION },
            ],
        }
    );

    const { loading } = useQuery(
        leadQueries.GET_COMPANY_CLIENTS,
        {
            variables: { companyId: userInfo?.companyId },
            skip: shouldSkipQuery(),
            onSuccess: ({ data }) => {
                setClients(data.getClients);
            },
            onError: (error: any) => {
                console.error('Leads query error:', error);
            },
            refetchAfterMutations: [
                { mutation: LOGIN_USER },
                { mutation: leadMutation.LEAD_ASSIGN_TO },
                { mutation: leadMutation.CREATE_LEAD },
                { mutation: leadMutation.APPROVED_LEAD_MUTATION },
            ],
        }
    );

    const { loading: prospectsLoading } = useQuery(
        leadQueries.GET_PROSPECT_LEADS,
        {
            skip: shouldSkipQuery(),
            onSuccess: ({ data }) => {
                if (data?.getCompanyProspects) {
                    setProspect(data.getCompanyProspects);
                }
            },
            onError: (error: any) => {
                console.error('Prospects query error:', error);
            },
            refetchAfterMutations: [
                { mutation: LOGIN_USER },
                { mutation: leadMutation.LEAD_ASSIGN_TO },
                { mutation: leadMutation.CREATE_LEAD },
                { mutation: leadMutation.CREATE_PROSPECT },
            ],
        }
    );

    const handleCreateLead = async ({ lead, error }: { 
        lead: z.infer<typeof leadSchema>, 
        error?: APIError<object> | undefined 
    }) => {
        if (error) {
            const message = error?.graphQLErrors?.map((e: any) => e.message).join(", ");
            toast({
                title: 'Error',
                description: message || "Something went wrong",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: 'Success',
            description: 'Prospect created successfully',
            variant: "default",
        });
    };

    const handleCreateBulkLead = async ({ lead, error }: { 
        lead: any, 
        error?: APIError<object> | undefined 
    }) => {
        if (error) {
            const message = error?.graphQLErrors?.map((e: any) => e.message).join(", ");
            toast({
                title: 'Error',
                description: message || "Something went wrong",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: 'Success',
            description: 'Prospects created successfully',
            variant: "default",
        });
    };

    return (
        <LeadContext.Provider value={{ handleCreateLead, handleCreateBulkLead }}>
            {children}
        </LeadContext.Provider>
    );
};

export const useLead = (): LeadProviderType => {
    const context = useContext(LeadContext);
    if (!context) {
        throw new Error('useLead must be used within a LeadProvider');
    }
    return context;
};