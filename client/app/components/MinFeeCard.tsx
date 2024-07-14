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
        <CardDescription>Minimum Fee (Lamports)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{minFee.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
