// components/MedianFeeCard.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MedianFeeCardProps {
  medianFee: number;
}

export function MedianFeeCard({ medianFee }: MedianFeeCardProps) {
  return (
    <Card className="h-24">
      <CardHeader className="pb-1 pt-5">
        <CardDescription>Median Fee (SOL)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {(medianFee / 1000000000).toLocaleString(undefined, {
            maximumFractionDigits: 8,
          })}{" "}
        </p>
      </CardContent>
    </Card>
  );
}
