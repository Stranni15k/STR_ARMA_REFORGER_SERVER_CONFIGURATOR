import type { ReactNode } from "react";

type PanelProps = {
  title?: ReactNode;
  elevated?: boolean;
  right?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export default function Panel({ title, elevated, right, className = "", children }: PanelProps) {
  return (
    <div className={`window ${elevated ? "window--elevated" : ""} ${className} mb-4`}>
      {(title || right) ? (
        <div className="window-header">
          <div className="d-flex align-items-center">
            <div className="window-title">{title}</div>
          </div>
          {right ? <div>{right}</div> : null}
        </div>
      ) : null}
      <div className="window-body">{children}</div>
    </div>
  );
}
