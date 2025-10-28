import { useState } from "react";
import { useConfigStore } from "../store/configStore";
import Panel from "../components/Panel";

export default function Summary() {
  const cfg = useConfigStore((s) => s.config);
  const json = JSON.stringify(cfg, null, 2);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      alert("Couldn't copy JSON to clipboard.");
    }
  };

  return (
    <Panel className="no-hover">
      <div>
        <div className="summary-header d-flex align-items-center justify-content-between mb-2">
          <h6 className="section-title mb-0">Preview JSON</h6>
          <div className="summary-actions d-flex align-items-center gap-2">
            {copied && <span className="copy-badge">Copied</span>}
            <button className="btn btn-outline-light btn-sm copy-btn" type="button" onClick={handleCopy}>
              Copy JSON
            </button>
          </div>
        </div>

        <div className="summary-preview mb-3">
          <pre><code>{json}</code></pre>
        </div>
      </div>
    </Panel>
  );
}
