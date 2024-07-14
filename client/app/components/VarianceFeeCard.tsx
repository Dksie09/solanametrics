// components/VarianceFeeCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VarianceFeeCardProps {
  varianceFee: number;
}

export function VarianceFeeCard({ varianceFee }: VarianceFeeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="font-medium">
          Variance Fee (Lamports)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold">{varianceFee.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
