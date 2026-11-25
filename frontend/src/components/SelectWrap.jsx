import { ChevronDown } from "lucide-react";

// Wraps a native select so the chevron can inherit the shared text color.
export default function SelectWrap({ children }) {
  return (
    <span className="select-wrap">
      {children}
      <ChevronDown className="select-chevron" size={16} aria-hidden="true" />
    </span>
  );
}
