// components/ModeFeeCard.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ModeFeeCardProps {
  modeFee: number;
}

export function ModeFeeCard({ modeFee }: ModeFeeCardProps) {
  return (
    <Card className="h-24">
      <CardHeader className="pb-1 pt-5">
        <CardDescription>Mode Fee</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {modeFee.toLocaleString()} Lamports
        </p>
      </CardContent>
    </Card>
  );
}
