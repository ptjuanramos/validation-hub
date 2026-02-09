import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, KeyRound, GitMerge, Tag, AlertTriangle, FileSearch } from "lucide-react";

interface Validation {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const initialValidations: Validation[] = [
  {
    id: "milestone",
    label: "Milestone Existence",
    description: "Ensures every MR is associated with a valid milestone before merging.",
    icon: Tag,
    enabled: true,
  },
  {
    id: "secrets",
    label: "Secrets Detection",
    description: "Scans diff for exposed API keys, tokens, and credentials.",
    icon: KeyRound,
    enabled: true,
  },
  {
    id: "approvals",
    label: "Minimum Approvals",
    description: "Requires at least 2 approvals before merge is allowed.",
    icon: GitMerge,
    enabled: false,
  },
  {
    id: "conflicts",
    label: "Merge Conflicts Check",
    description: "Blocks merge if unresolved conflicts are detected.",
    icon: AlertTriangle,
    enabled: true,
  },
  {
    id: "changelog",
    label: "Changelog Entry",
    description: "Validates that a changelog entry exists for the changes.",
    icon: FileSearch,
    enabled: false,
  },
];

const MRValidationsPage = () => {
  const [validations, setValidations] = useState<Validation[]>(initialValidations);

  const toggle = (id: string) => {
    setValidations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, enabled: !v.enabled } : v))
    );
  };

  const enabledCount = validations.filter((v) => v.enabled).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Merge Request Validations
        </h1>
        <p className="text-muted-foreground text-sm">
          Toggle validations that run on every merge request.{" "}
          <span className="text-primary font-medium">{enabledCount}</span> of{" "}
          {validations.length} active.
        </p>
      </div>

      <div className="space-y-3">
        {validations.map((v) => (
          <div
            key={v.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              v.enabled
                ? "bg-card border-primary/20"
                : "bg-muted/30 border-border"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center ${
                  v.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <v.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{v.label}</p>
                <p className="text-xs text-muted-foreground">{v.description}</p>
              </div>
            </div>
            <Switch checked={v.enabled} onCheckedChange={() => toggle(v.id)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MRValidationsPage;
