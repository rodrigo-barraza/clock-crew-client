import WikiSidebarComponent from "../components/WikiSidebarComponent/WikiSidebarComponent";

export default function WikiLayout({ children }: any) {
  return (
    <div className="wiki-layout">
      <WikiSidebarComponent />
      <main className="wiki-content">{children}</main>
    </div>
  );
}
