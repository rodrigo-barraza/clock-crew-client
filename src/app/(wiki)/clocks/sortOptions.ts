export const SORT_OPTIONS = [
  { key: "posts", label: "Most Posts" },
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "alpha", label: "A → Z" },
] as const;

export type DirectorySort = (typeof SORT_OPTIONS)[number]["key"];

export function parseSort(value: unknown): DirectorySort {
  const text = Array.isArray(value) ? value[0] : value;
  return SORT_OPTIONS.some((option) => option.key === text)
    ? (text as DirectorySort)
    : "posts";
}
