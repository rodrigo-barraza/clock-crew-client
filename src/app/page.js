"use client";

import { useRef, useCallback } from "react";
import DiscordChatComponent from "./components/DiscordChatComponent/DiscordChatComponent";

export default function Home() {
  const heroRef = useRef(null);

  const handleJoinHover = useCallback((hovering) => {
    heroRef.current?.classList.toggle("hero--energized", hovering);
  }, []);

  return (
    <main className="hero" ref={heroRef}>
      <div className="hero-content">
        <h1 className="hero-title">Clock Crew</h1>
        <p className="hero-subtitle">
          The legendary Newgrounds Flash animation collective — est. 2002
        </p>
        <section
          aria-label="Community Discord Live Feed"
          style={{ marginTop: "32px", width: "100%", maxWidth: "820px" }}
        >
          <DiscordChatComponent messageCount={500} joinMode onJoinHoverChange={handleJoinHover} />
        </section>
      </div>
    </main>
  );
}
