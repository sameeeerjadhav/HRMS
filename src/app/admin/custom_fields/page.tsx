import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/prisma";
import CustomFieldsClientComponent from "@/components/CustomFieldsClientComponent";

export default async function CustomFieldsPage() {
  const fields = await prisma.custom_field_meta.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <>
      <Topbar title="Custom Fields" breadcrumb="Configuration / Custom Fields" user="Admin User" role="System Admin" />
      <div className="page-body">
        <CustomFieldsClientComponent initialFields={fields} />
      </div>
    </>
  );
}
