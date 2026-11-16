import { useEffect, useId } from "react";
import { unsavedEditors } from "./ux";

export function useUnsavedChanges(dirty) {
  const id = useId();
  useEffect(() => {
    if (!dirty) return;
    unsavedEditors.add(id);
    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      unsavedEditors.delete(id);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [dirty, id]);
}
