"use client"

import { useEffect, useState } from "react";
import { CreateLeadModal } from "../modals/create-lead-modal";
import { AssignLeadModal } from "../modals/assign-lead-modal";
import { SubmitLeadModal } from "../modals/submit-lead-modal";
import { BidFormModal } from "../modals/bid-form-modal";
import { FinancerBidApprovalModal } from "../modals/financer-bid-approval-modal";
import { ViewLeadInfoModal } from "../modals/view-lead-info-modal";


export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;


  return (
    <>
      <CreateLeadModal/>
      <AssignLeadModal/>
      <SubmitLeadModal/>
      <BidFormModal/>
      <FinancerBidApprovalModal/>
      <ViewLeadInfoModal/>

    </>
  );
};
