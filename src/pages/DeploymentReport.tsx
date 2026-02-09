import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  ExternalLink,
  GitBranch,
  GitMerge,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface Component {
  name: string;
  version: string;
  repoUrl: string;
  lastPipeline: { id: string; status: "success" | "failed" | "running"; date: string };
  lastMR: { title: string; url: string; author: string };
}

const MILESTONES = ["v3.12.0", "v3.11.0", "v3.10.0", "v3.9.0"];

const MOCK_COMPONENTS: Record<string, Component[]> = {
  "v3.12.0": [
    { name: "auth-service", version: "2.4.1", repoUrl: "https://gitlab.com/org/auth-service", lastPipeline: { id: "#84521", status: "success", date: "2026-02-08" }, lastMR: { title: "Fix token refresh logic", url: "https://gitlab.com/org/auth-service/-/merge_requests/142", author: "jdoe" } },
    { name: "api-gateway", version: "1.8.0", repoUrl: "https://gitlab.com/org/api-gateway", lastPipeline: { id: "#84519", status: "success", date: "2026-02-07" }, lastMR: { title: "Add rate limiting headers", url: "https://gitlab.com/org/api-gateway/-/merge_requests/97", author: "asmith" } },
    { name: "notification-worker", version: "3.1.2", repoUrl: "https://gitlab.com/org/notification-worker", lastPipeline: { id: "#84515", status: "failed", date: "2026-02-07" }, lastMR: { title: "Migrate to new email provider", url: "https://gitlab.com/org/notification-worker/-/merge_requests/63", author: "mchen" } },
    { name: "dashboard-ui", version: "5.0.0", repoUrl: "https://gitlab.com/org/dashboard-ui", lastPipeline: { id: "#84510", status: "success", date: "2026-02-06" }, lastMR: { title: "Redesign settings page", url: "https://gitlab.com/org/dashboard-ui/-/merge_requests/210", author: "jdoe" } },
  ],
  "v3.11.0": [
    { name: "auth-service", version: "2.3.0", repoUrl: "https://gitlab.com/org/auth-service", lastPipeline: { id: "#83200", status: "success", date: "2026-01-20" }, lastMR: { title: "Add OAuth2 support", url: "https://gitlab.com/org/auth-service/-/merge_requests/138", author: "asmith" } },
    { name: "billing-service", version: "1.2.5", repoUrl: "https://gitlab.com/org/billing-service", lastPipeline: { id: "#83198", status: "success", date: "2026-01-19" }, lastMR: { title: "Fix invoice generation", url: "https://gitlab.com/org/billing-service/-/merge_requests/44", author: "mchen" } },
  ],
  "v3.10.0": [
    { name: "dashboard-ui", version: "4.9.0", repoUrl: "https://gitlab.com/org/dashboard-ui", lastPipeline: { id: "#82100", status: "success", date: "2026-01-05" }, lastMR: { title: "Add dark mode toggle", url: "https://gitlab.com/org/dashboard-ui/-/merge_requests/195", author: "jdoe" } },
  ],
  "v3.9.0": [
    { name: "api-gateway", version: "1.7.0", repoUrl: "https://gitlab.com/org/api-gateway", lastPipeline: { id: "#81000", status: "success", date: "2025-12-18" }, lastMR: { title: "Upgrade dependencies", url: "https://gitlab.com/org/api-gateway/-/merge_requests/88", author: "asmith" } },
    { name: "notification-worker", version: "3.0.0", repoUrl: "https://gitlab.com/org/notification-worker", lastPipeline: { id: "#80998", status: "running", date: "2025-12-17" }, lastMR: { title: "Add SMS channel", url: "https://gitlab.com/org/notification-worker/-/merge_requests/55", author: "mchen" } },
  ],
};

const pipelineStatusColor: Record<string, string> = {
  success: "text-success",
  failed: "text-destructive",
  running: "text-primary",
};

const DeploymentReportPage = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<string>("");
  const [ignoredComponents, setIgnoredComponents] = useState<Set<string>>(new Set());

  const components = selectedMilestone ? MOCK_COMPONENTS[selectedMilestone] ?? [] : [];
  const visibleComponents = useMemo(
    () => components.filter((c) => !ignoredComponents.has(c.name)),
    [components, ignoredComponents]
  );

  const toggleIgnore = (name: string) => {
    setIgnoredComponents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const generateReport = (format: "text" | "markdown" | "pdf") => {
    if (visibleComponents.length === 0) {
      toast.error("No components to include in the report.");
      return;
    }

    const title = `Deployment Report — ${selectedMilestone}`;
    const date = new Date().toLocaleDateString();

    if (format === "text") {
      const lines = [
        title,
        `Generated: ${date}`,
        `Components: ${visibleComponents.length}`,
        "",
        ...visibleComponents.map(
          (c) =>
            `• ${c.name} (${c.version})\n  Repo: ${c.repoUrl}\n  Pipeline: ${c.lastPipeline.id} [${c.lastPipeline.status}] ${c.lastPipeline.date}\n  Last MR: "${c.lastMR.title}" by ${c.lastMR.author}\n  ${c.lastMR.url}`
        ),
      ];
      downloadFile(`${title}.txt`, lines.join("\n"), "text/plain");
    } else if (format === "markdown") {
      const lines = [
        `# ${title}`,
        `**Generated:** ${date}  `,
        `**Components:** ${visibleComponents.length}`,
        "",
        "| Component | Version | Pipeline | Status | Last MR |",
        "|-----------|---------|----------|--------|---------|",
        ...visibleComponents.map(
          (c) =>
            `| [${c.name}](${c.repoUrl}) | ${c.version} | ${c.lastPipeline.id} (${c.lastPipeline.date}) | ${c.lastPipeline.status} | [${c.lastMR.title}](${c.lastMR.url}) by ${c.lastMR.author} |`
        ),
      ];
      downloadFile(`${title}.md`, lines.join("\n"), "text/markdown");
    } else {
      // For PDF we open a printable window
      const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:sans-serif;padding:40px;color:#222}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5}</style></head><body><h1>${title}</h1><p>Generated: ${date} — ${visibleComponents.length} components</p><table><tr><th>Component</th><th>Version</th><th>Pipeline</th><th>Status</th><th>Last MR</th></tr>${visibleComponents
        .map(
          (c) =>
            `<tr><td><a href="${c.repoUrl}">${c.name}</a></td><td>${c.version}</td><td>${c.lastPipeline.id} (${c.lastPipeline.date})</td><td>${c.lastPipeline.status}</td><td><a href="${c.lastMR.url}">${c.lastMR.title}</a> by ${c.lastMR.author}</td></tr>`
        )
        .join("")}</table><script>window.print()</script></body></html>`;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
      }
    }

    toast.success(`Report generated as ${format.toUpperCase()}`);
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Deployment Report
        </h1>
        <p className="text-muted-foreground text-sm">
          Select a milestone to see which components are expected for production deployment.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedMilestone} onValueChange={(v) => { setSelectedMilestone(v); setIgnoredComponents(new Set()); }}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select milestone" />
          </SelectTrigger>
          <SelectContent>
            {MILESTONES.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedMilestone && (
          <span className="text-xs text-muted-foreground">
            {visibleComponents.length} component{visibleComponents.length !== 1 && "s"} included
            {ignoredComponents.size > 0 && `, ${ignoredComponents.size} ignored`}
          </span>
        )}
      </div>

      {selectedMilestone && components.length > 0 && (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">Include</th>
                  <th className="px-4 py-3 text-left font-medium">Component</th>
                  <th className="px-4 py-3 text-left font-medium">Version</th>
                  <th className="px-4 py-3 text-left font-medium">Last Pipeline (TE2)</th>
                  <th className="px-4 py-3 text-left font-medium">Last MR</th>
                </tr>
              </thead>
              <tbody>
                {components.map((c) => {
                  const ignored = ignoredComponents.has(c.name);
                  return (
                    <tr
                      key={c.name}
                      className={`border-t border-border transition-colors ${
                        ignored ? "opacity-40" : "hover:bg-accent/30"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={!ignored}
                          onCheckedChange={() => toggleIgnore(c.name)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={c.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                          >
                            {c.name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.version}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5" />
                          <span className="font-mono text-xs">{c.lastPipeline.id}</span>
                          <span className={`text-xs font-medium ${pipelineStatusColor[c.lastPipeline.status]}`}>
                            {c.lastPipeline.status}
                          </span>
                          <span className="text-xs text-muted-foreground">{c.lastPipeline.date}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GitMerge className="w-3.5 h-3.5 text-muted-foreground" />
                          <a
                            href={c.lastMR.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs hover:text-primary transition-colors truncate max-w-[200px]"
                          >
                            {c.lastMR.title}
                          </a>
                          <span className="text-xs text-muted-foreground">by {c.lastMR.author}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-muted-foreground mr-1">Export as:</span>
            <Button variant="outline" size="sm" onClick={() => generateReport("text")}>
              <Download className="w-4 h-4 mr-1.5" />
              Plain Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateReport("markdown")}>
              <Download className="w-4 h-4 mr-1.5" />
              Markdown
            </Button>
            <Button size="sm" onClick={() => generateReport("pdf")}>
              <Download className="w-4 h-4 mr-1.5" />
              PDF
            </Button>
          </div>
        </>
      )}

      {selectedMilestone && components.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No components found for this milestone.
        </div>
      )}
    </div>
  );
};

export default DeploymentReportPage;
