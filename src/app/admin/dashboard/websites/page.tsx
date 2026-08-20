import { Suspense } from "react";
import WebsitesClient from "./WebsitesClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Loading Websites...</div>}>
      <WebsitesClient />
    </Suspense>
  );
}
