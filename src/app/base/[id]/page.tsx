import { requireAuth } from "~/app/_components/auth";
import BaseView from "~/app/_components/BaseView";

interface BasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BasePage({ params }: BasePageProps) {
  const { id } = await params;
  
  // Re-enable auth check
  const { session, user } = await requireAuth();

  // For now, use sample data to get the UI working
  // TODO: Integrate with database
  const base = {
    id: id,
    name: "Untitled Base",
    tables: [
      {
        id: "1",
        name: "Table 1",
        columns: [
          { id: "1", name: "Name", type: "text" as const, order: 0, isRequired: true },
          { id: "2", name: "Notes", type: "text" as const, order: 1, isRequired: false },
          { id: "3", name: "Assignee", type: "text" as const, order: 2, isRequired: false },
          { id: "4", name: "Status", type: "text" as const, order: 3, isRequired: false },
          { id: "5", name: "Attachments", type: "text" as const, order: 4, isRequired: false },
          { id: "6", name: "Attachment Sum", type: "number" as const, order: 5, isRequired: false },
        ],
        rows: [
          { 
            id: "1", 
            data: {
              "1": "Project Alpha",
              "2": "Initial planning phase",
              "3": "John Doe",
              "4": "In Progress",
              "5": "2 files",
              "6": ""
            }
          },
          { 
            id: "2", 
            data: {
              "1": "Project Beta",
              "2": "Development started",
              "3": "Jane Smith",
              "4": "Active",
              "5": "5 files",
              "6": ""
            }
          },
          { 
            id: "3", 
            data: {
              "1": "Project Gamma",
              "2": "Testing phase",
              "3": "Mike Johnson",
              "4": "Review",
              "5": "1 file",
              "6": ""
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <BaseView base={base} />
    </div>
  );
}
