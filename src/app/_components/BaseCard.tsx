"use client";

import Link from "next/link";

export default function BaseCard({ base }: { base: { id: string; name: string; color: string } }) {
  return (
    <Link href={`/base/${base.id}`}>
      <div className="rounded-xl shadow-md bg-white hover:shadow-lg transition p-6 border cursor-pointer">
        <div className="w-10 h-10 rounded-md mb-3" style={{ backgroundColor: base.color }} />
        <h3 className="font-semibold">{base.name}</h3>
      </div>
    </Link>
  );
}