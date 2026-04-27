import HistoryTimelineComponent from "../../components/HistoryTimelineComponent/HistoryTimelineComponent";

export const metadata = {
  title: "History of the Clock Crew",
  description:
    "The complete history of the Clock Crew — from StrawberryClock's legendary 'B' submission in 2001 to the modern archival era. Explore the founding, golden age, rivalries, and legacy of Newgrounds' most iconic Flash animation collective.",
  openGraph: {
    title: "History of the Clock Crew",
    description:
      "Explore the full history of the Clock Crew — Newgrounds' legendary Flash animation collective, est. 2002.",
  },
};

export default function HistoryPage() {
  return <HistoryTimelineComponent />;
}
