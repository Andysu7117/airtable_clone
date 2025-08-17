import BaseGrid from "../_components/BaseGrid"
import Header from "../_components/Header";

export default async function HomePage() {
  const bases = [
    { id: "1", name: "Marketing CRM", color: "blue" },
    { id: "2", name: "Product Roadmap", color: "green" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6">
        <BaseGrid bases={bases} />
      </main>
    </div>
  );
}