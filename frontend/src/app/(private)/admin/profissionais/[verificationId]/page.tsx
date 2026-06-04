import { AdminProfessionalVerificationDetailPage } from "@/features/admin/components/AdminProfessionalVerificationDetailPage";

type AdminProfessionalVerificationDetailRouteProps = {
  params: Promise<{
    verificationId: string;
  }>;
};

export default async function AdminProfessionalVerificationDetailRoute({
  params,
}: AdminProfessionalVerificationDetailRouteProps) {
  const { verificationId } = await params;

  return <AdminProfessionalVerificationDetailPage verificationId={verificationId} />;
}
