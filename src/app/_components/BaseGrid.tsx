import BaseCard from "./BaseCard";
import NewBaseCard from "./NewBaseCard";

export default function BaseGrid({ bases }: { bases: {id: string; name: string; color: string;}[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {bases.map((base) => (
        <BaseCard key={base.id} base={base} />
      ))}
      <NewBaseCard />
    </div>
  );
}