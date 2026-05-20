import WikiSidebarComponent from "../components/WikiSidebarComponent/WikiSidebarComponent";

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wiki-layout">
      <WikiSidebarComponent />
      <main className="wiki-content">{children}</main>
    </div>
  );
}
