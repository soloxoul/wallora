import AdminServiceForm from "@/components/admin/AdminServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminServiceForm serviceId={id} />;
}