import { Sprout } from "lucide-react";

export default function LoadingScreen({ message = "Preparing your agricultural intelligence dashboard..." }: { message?: string }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-brand">
        <span className="brand-mark"><Sprout size={21} /></span>
        <span className="brand-copy">dust<span>2</span>farm<small>FIELD INTELLIGENCE</small></span>
      </div>
      <div className="growth-mark"><span /><i /><b /></div>
      <p>{message}</p>
      <div className="loading-track"><i /></div>
      <small>From Earth Observation to Smarter Agriculture</small>
    </div>
  );
}
