import {PageWrapper} from "@/components/layout/PageWrapper";
import {BillingInvoicing} from "@/components/opera/BillingInvoicing";
import {useNavigate} from "react-router-dom";

export default function BillingPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Billing & Invoicing"
      subtitle="Manage invoices, payments, and billing"
    >
      <BillingInvoicing
        onCreateInvoice={() => {
          console.log("Create new invoice");
        }}
        onViewInvoice={(id) => {
          console.log("View invoice:", id);
        }}
        onSendInvoice={(id) => {
          console.log("Send invoice:", id);
        }}
        onDownloadInvoice={(id) => {
          console.log("Download invoice:", id);
        }}
      />
    </PageWrapper>
  );
}

