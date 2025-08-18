// import { notFound } from "next/navigation";
import BaseView from "~/app/_components/BaseView";

interface BasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BasePage({ params }: BasePageProps) {
  const { id } = await params;
  
  // TODO: Re-enable auth check after testing
  // const session = await auth();
  // if (!session?.user) {
  //   return notFound();
  // }

  // Test data for development
  const base = {
    id: id,
    name: "Untitled Base",
    tables: [
      {
        id: "1",
        name: "Table 1",
        columns: [
          { id: "1", name: "Name", type: "text" as const },
          { id: "2", name: "Notes", type: "text" as const },
          { id: "3", name: "Assignee", type: "text" as const },
          { id: "4", name: "Status", type: "text" as const },
        ],
        rows: []
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <BaseView base={base} />
    </div>
  );
}
