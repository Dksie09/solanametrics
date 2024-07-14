// components/MaxFeeCard.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MaxFeeCardProps {
  maxFee: number;
}

export function MaxFeeCard({ maxFee }: MaxFeeCardProps) {
  return (
    <Card className="h-24">
      <CardHeader className="pb-1 pt-5">
        <CardDescription>Maximum Fee (SOL)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {(maxFee / 1000000000).toLocaleString(undefined, {
            maximumFractionDigits: 5,
          })}{" "}
        </p>
      </CardContent>
    </Card>
  );
}
