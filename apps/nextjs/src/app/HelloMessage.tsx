import { fetchQuery } from "convex/nextjs";
import { api } from "@workforce/convex/api";

export async function HelloMessage() {
  const hello = await fetchQuery(api.hello.get);

  return (
    <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
      {hello}
    </p>
  );
}
