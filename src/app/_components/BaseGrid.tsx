import BaseCard from "./BaseCard";
import NewBaseCard from "./NewBaseCard";

interface Base {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  tables: Array<{
    id: string;
    name: string;
    columns: Array<{
      id: string;
      name: string;
      type: string;
      order: number;
    }>;
  }>;
}

interface BaseGridProps {
  bases: Base[];
  onDelete: () => void;
  onRename: (base: { id: string; name: string }) => void;
  onCreateClick: () => void;
}

export default function BaseGrid({ bases, onDelete, onRename, onCreateClick }: BaseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {bases.map((base) => (
        <BaseCard key={base.id} base={base} onDelete={onDelete} onRename={onRename} />
      ))}
      <NewBaseCard onClick={onCreateClick} />
    </div>
  );
}