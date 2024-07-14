// components/MinFeeCard.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MinFeeCardProps {
  minFee: number;
}

export function MinFeeCard({ minFee }: MinFeeCardProps) {
  return (
    <Card className="h-[86px]">
      <CardHeader className="pb-1 pt-4">
        <CardDescription>Minimum Fee (SOL)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {(minFee / 1000000000).toLocaleString(undefined, {
            maximumFractionDigits: 8,
          })}{" "}
        </p>
      </CardContent>
    </Card>
  );
}
