import { Sprout } from "lucide-react";

export default function LoadingScreen({ message = "Loading your farm workspace" }: { message?: string }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-brand">
        <span className="brand-mark"><Sprout size={21} /></span>
        <span className="brand-copy">Dust<span>2</span>Farm<small>FARM MONITORING</small></span>
      </div>
      <div className="growth-mark"><span /><i /><b /></div>
      <p>{message}</p>
      <div className="loading-track"><i /></div>
      <small>Farm monitoring and field operations</small>
    </div>
  );
}
