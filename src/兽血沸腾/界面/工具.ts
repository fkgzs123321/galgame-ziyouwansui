// MVU 的集合字段统一为「按名索引的 record」，而界面大多需要列表。
// 这里集中提供 record/array 双兼容的换算，避免各面板各写一遍。
export type 记录<T> = Record<string, T> | T[] | null | undefined;

/** 把 record 或 array 统一摊平成带 名称 的列表 */
export function 列<T extends Record<string, any>>(v: 记录<T>, 键 = '名称'): (T & Record<string, any>)[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((it, i) =>
      it && typeof it === 'object' ? { ...it, [键]: (it as any)[键] ?? (it as any).name ?? String(i) } : ({ [键]: String(it) } as any),
    );
  }
  return Object.entries(v).map(([name, it]) => ({
    ...(it && typeof it === 'object' ? it : { 值: it }),
    [键]: name,
  }));
}

/** record 或 array 的条目数 */
export function 计数(v: unknown): number {
  if (!v) return 0;
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'object') return Object.keys(v as object).length;
  return 0;
}

/** 字符串字段可能被写成数组或顿号串，统一成展示用列表 */
export function 标签(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') return v.split(/[、,，]/).map(s => s.trim()).filter(Boolean);
  return [String(v)];
}

/** 取 record 或 array 里某个键的值列表 */
export function 键(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x, i) => String((x as any)?.名称 ?? (x as any)?.name ?? i));
  if (typeof v === 'object') return Object.keys(v as object);
  return [];
}
