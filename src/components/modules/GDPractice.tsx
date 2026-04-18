import { useState } from "react";
import { Users } from "lucide-react";
import { TextPracticeCard } from "./TextPracticeCard";

const TOPICS = [
  "Is remote work the future of employment?",
  "Should AI replace human teachers in classrooms?",
  "Social media: boon or bane for Gen Z?",
  "Is a startup career better than a corporate job for freshers?",
  "Should college education be free for all?",
];

export function GDPractice() {
  const [topic, setTopic] = useState(TOPICS[0]);
  return (
    <TextPracticeCard
      module="gd"
      title="Group Discussion"
      icon={<Users className="w-5 h-5 text-accent" />}
      prompt={topic}
      setPrompt={setTopic}
      promptOptions={TOPICS}
    />
  );
}
