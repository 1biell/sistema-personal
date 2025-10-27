import React from "react";

export default function SectionHeader({ title, subtitle, children }) {
  return (
    <div className="section-header">
      <div className="section-titles">
        <h2 className="section-title">{title}</h2>
        {subtitle ? <div className="section-subtitle">{subtitle}</div> : null}
      </div>
      {children ? <div className="section-actions">{children}</div> : null}
    </div>
  );
}

