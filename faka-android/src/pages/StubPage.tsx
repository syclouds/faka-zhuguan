import type { ComponentType } from 'react';

/** 页面通用 props：由 NavHost 注入路由参数 */
export interface PageProps {
  params: Record<string, string>;
}

/** T02 占位页（页面批次 T04/T05 落地后在 pageMap 中替换） */
export function StubPage({ params }: PageProps) {
  void params;
  return (
    <div className="h-full overflow-auto pt-safe">
      <div className="p-4 text-sm text-sub">页面建设中（T04/T05 批次落地）</div>
    </div>
  );
}
