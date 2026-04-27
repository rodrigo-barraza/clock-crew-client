import WikiSidebarComponent from "../components/WikiSidebarComponent/WikiSidebarComponent";

export default function WikiLayout({ children }) {
  return (
    <div className="wiki-layout">
      <WikiSidebarComponent />
      <main className="wiki-content">{children}</main>
    </div>
  );
}
