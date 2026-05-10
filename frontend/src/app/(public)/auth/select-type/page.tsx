import { Suspense } from "react";
import { SelectTypeFlow } from "@/features/usertypeselection/components/SelectTypeFlow";

export default function SelectTypePage() {
  return (
    <Suspense fallback={null}>
      <SelectTypeFlow />
    </Suspense>
  );
}
