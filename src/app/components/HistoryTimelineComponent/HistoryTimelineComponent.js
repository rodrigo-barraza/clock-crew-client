"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./HistoryTimelineComponent.module.css";

// ── Clock Crew History — Static Content ──────────────────────────
const TIMELINE_EVENTS = [
  {
    year: "2001",
    title: "The Birth of B",
    content:
      "StrawberryClock submits \"B\" to the Newgrounds Flash Portal — a deliberately simple animation consisting of the letter B and a picture of a strawberry. Against all odds, it passes judgment. The absurdist humor and its baffling survival mark the genesis of a movement. StrawberryClock declares himself the King of the Portal.",
    era: "origins",
  },
  {
    year: "2002",
    title: "The Clock Crew Forms",
    content:
      "Inspired by StrawberryClock's success, a wave of users adopt \"Clock\" personas — appending Clock to a food, object, or concept to create characters like OrangeClock, BananaClock, and RaspberryClock. The Clock Crew crystallizes into Newgrounds' first organized Flash collective. Members develop a shared visual identity: clock-face characters with text-to-speech voices, using the Speakonia and AT&T Natural Voices TTS engines.",
    era: "origins",
  },
  {
    year: "2002",
    title: "ClockCrew.net Launches",
    content:
      "The community establishes its own forum at ClockCrew.net, running on SMF (Simple Machines Forum). It becomes the crew's primary gathering point outside Newgrounds — a place to organize collaborations, share WIPs, and build the lore. At its peak, the forum hosts hundreds of active members and over 700,000 posts across dozens of boards.",
    era: "origins",
  },
  {
    year: "2003",
    title: "Clock Day — August 15",
    content:
      "The first annual Clock Day is held on August 15th to commemorate the anniversary of \"B\". Clock Crew members flood the Newgrounds portal with submissions, overwhelming the voting system and guaranteeing nearly everything passes. It becomes one of Newgrounds' most legendary annual traditions, celebrated (and dreaded) for years to come.",
    era: "golden",
  },
  {
    year: "2003–04",
    title: "The Golden Age",
    content:
      "The Clock Crew enters its golden era. Members like VCRClock, OrangeClock, and StrawberryClock himself produce increasingly ambitious Flash animations. The crew pioneers collab movies — large-scale compilations featuring dozens of members contributing individual segments. The distinctive style of clock-face characters, TTS dialogue, and absurdist humor becomes iconic on Newgrounds.",
    era: "golden",
  },
  {
    year: "2003",
    title: "The Lock Legion Emerges",
    content:
      "A rival collective called the Lock Legion forms, led by members using padlock-themed characters. What begins as imitation quickly evolves into a friendly rivalry. The Clock-Lock dynamic fuels creative output on both sides, with each group trying to outdo the other in submissions, collabs, and Clock Day participation.",
    era: "golden",
  },
  {
    year: "2004–05",
    title: "Collabs & Community Peaks",
    content:
      "The Clock Crew produces some of its most memorable collaborative works. Clock Day submissions grow more elaborate each year, ranging from genuine tributes to intentional shitposting masterpieces. The forum culture thrives with in-jokes, drama, art threads, and a uniquely chaotic creative energy. Many members are teenagers finding their voice through Flash animation.",
    era: "golden",
  },
  {
    year: "2006–08",
    title: "Maturation & Diaspora",
    content:
      "As the founding generation grows older, activity begins to shift. Some members pursue professional careers in animation, game design, or web development — skills honed through years of Flash experimentation. The core community remains active but the explosive growth period plateaus. New crews and collectives emerge on Newgrounds, inspired by the Clock Crew model.",
    era: "middle",
  },
  {
    year: "2010–14",
    title: "The Long Twilight",
    content:
      "Flash's dominance on the web wanes as HTML5, mobile browsers, and YouTube reshape internet culture. Newgrounds adapts but the era of Flash animation collectives begins to fade. The Clock Crew continues to observe Clock Day annually, but the forum activity declines. Some members maintain friendships through Discord, social media, and occasional reunions on the portal.",
    era: "middle",
  },
  {
    year: "2017",
    title: "ClockCrew.net Goes Read-Only",
    content:
      "The forum at ClockCrew.net transitions to a read-only archive, preserving hundreds of thousands of posts and years of community history. The decision reflects the reality that active discussion has moved to Discord and other platforms, but the archive remains a treasure trove of early internet culture.",
    era: "modern",
  },
  {
    year: "2020",
    title: "Flash End of Life",
    content:
      "Adobe officially ends support for Flash Player on December 31, 2020. Newgrounds leads the preservation effort with Ruffle, an open-source Flash emulator written in Rust, ensuring that the vast library of Clock Crew animations (and all Flash content) remains playable in modern browsers. The crew's legacy is preserved for future generations.",
    era: "modern",
  },
  {
    year: "2024+",
    title: "The Archival Era",
    content:
      "The complete ClockCrew.net forum archive — boards, threads, posts, and user profiles — is systematically preserved and indexed. Newgrounds profiles and submission histories are cross-referenced and cataloged. Clock Day continues to be observed. The Clock Crew's influence on internet culture, collaborative content creation, and the Newgrounds ecosystem is increasingly recognized as historically significant.",
    era: "modern",
  },
];

const ERA_COLORS = {
  origins: "#f59e0b",
  golden: "#10b981",
  middle: "#3b82f6",
  modern: "#a855f7",
};

export default function HistoryTimelineComponent() {
  const timelineRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(new Set());

  // IntersectionObserver for scroll-triggered reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.add(entry.target.dataset.index);
              return next;
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    const items = timelineRef.current?.querySelectorAll("[data-index]");
    items?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.timelineWrap}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.title}>History of the Clock Crew</h1>
        <p className={styles.subtitle}>
          From a single letter to an internet legend — the story of Newgrounds&apos;
          most iconic Flash animation collective.
        </p>

        {/* ── Era Legend ──────────────────────────────────────────── */}
        <div className={styles.legend}>
          {[
            { key: "origins", label: "Origins" },
            { key: "golden", label: "Golden Age" },
            { key: "middle", label: "Evolution" },
            { key: "modern", label: "Modern Era" },
          ].map((era) => (
            <span key={era.key} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: ERA_COLORS[era.key] }}
              />
              {era.label}
            </span>
          ))}
        </div>
      </header>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <div className={styles.timeline} ref={timelineRef}>
        {/* Center rail */}
        <div className={styles.rail} aria-hidden="true" />

        {TIMELINE_EVENTS.map((event, i) => {
          const isVisible = visibleItems.has(String(i));
          const side = i % 2 === 0 ? "left" : "right";

          return (
            <div
              key={i}
              className={`${styles.item} ${styles[`item--${side}`]} ${isVisible ? styles.itemVisible : ""}`}
              data-index={i}
            >
              {/* Node on the rail */}
              <div
                className={styles.node}
                style={{
                  borderColor: ERA_COLORS[event.era],
                  boxShadow: isVisible
                    ? `0 0 12px ${ERA_COLORS[event.era]}40`
                    : "none",
                }}
              >
                <div
                  className={styles.nodeInner}
                  style={{ background: ERA_COLORS[event.era] }}
                />
              </div>

              {/* Content card */}
              <div className={styles.card}>
                <span
                  className={styles.cardYear}
                  style={{ color: ERA_COLORS[event.era] }}
                >
                  {event.year}
                </span>
                <h3 className={styles.cardTitle}>{event.title}</h3>
                <p className={styles.cardContent}>{event.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
