// components/MeanFeeCard.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MeanFeeCardProps {
  meanFee: number;
}

export function MeanFeeCard({ meanFee }: MeanFeeCardProps) {
  return (
    <Card className="h-24">
      <CardHeader className="pb-1 pt-5">
        <CardDescription>Mean Fee (SOL)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {(meanFee / 1000000000).toLocaleString(undefined, {
            maximumFractionDigits: 8,
          })}{" "}
        </p>
      </CardContent>
    </Card>
  );
}
