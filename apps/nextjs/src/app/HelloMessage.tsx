"use client";

import { useQuery } from "convex/react";
import { api } from "@workforce/convex/api";

export function HelloMessage() {
  const hello = useQuery(api.hello.get);

  return (
    <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
      {hello ?? "Loading..."}
    </p>
  );
}

