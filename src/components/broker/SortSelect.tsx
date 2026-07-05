"use client";
// src/components/broker/SortSelect.tsx
import { useRouter } from "next/navigation";

interface Props {
  currentSort: string;
  currentParams: Record<string, string | undefined>;
}

export default function SortSelect({ currentSort, currentParams }: Props) {
  const router = useRouter();

  return (
    <select
      defaultValue={currentSort}
      onChange={(e) => {
        const next = { ...currentParams, sort: e.target.value } as Record<string, string>;
        Object.keys(next).forEach((key) => {
          if (!next[key]) delete next[key];
        });
        router.push(`/brokers?${new URLSearchParams(next).toString()}`);
      }}
      className="form-select"
    >
      <option value="trustScore">Trust Score</option>
      <option value="minDeposit">Min. Deposit (Low)</option>
      <option value="name">Name (A-Z)</option>
    </select>
  );
}
