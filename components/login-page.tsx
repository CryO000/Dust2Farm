"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Satellite, Sprout } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDemoSession } from "@/lib/demo-session";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState("");
  const router = useRouter();

  const enterDemo = () => {
    createDemoSession(remember);
    router.replace("/");
  };

  return (
    <main className="login-page">
      <section className="login-art" aria-label="Dust2Farm farm monitoring">
        <div className="login-art-image" />
        <Link className="login-brand" href="/login">
          <span className="brand-mark"><Sprout size={20} /></span>
          <span className="brand-copy">Dust<span>2</span>Farm<small>FARM MONITORING</small></span>
        </Link>
        <div className="login-art-content">
          <span className="login-overline"><Satellite size={14} /> FARM OPERATIONS</span>
          <h1>Farm conditions<br />and operations.</h1>
          <p>Review field conditions, sensor readings, irrigation schedules, and maintenance in one place.</p>
        </div>
        <div className="login-image-caption"><span>HAWTHORNE FARM, IOWA</span><span>41.878° N, 93.097° W</span></div>
      </section>

      <section className="login-form-side">
        <div className="login-mobile-brand">
          <span className="brand-mark"><Sprout size={20} /></span><span className="brand-copy">Dust<span>2</span>Farm<small>FARM MONITORING</small></span>
        </div>
        <div className="login-form-card">
          <div className="login-heading">
            <span className="login-kicker">DEMO WORKSPACE</span>
            <h2>Farm monitoring</h2>
            <p>Open the sample farm workspace.</p>
          </div>

          <div className="auth-demo-banner">
            <span className="auth-demo-mark"><Sprout size={16} /></span>
            <span><strong>Demo access</strong><small>No account or password is required. The workspace uses sample data.</small></span>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); enterDemo(); }}>
            <label className="login-label" htmlFor="email">Email address</label>
            <div className="login-input-wrap"><Mail size={16} /><input id="email" type="email" placeholder="you@yourfarm.com" autoComplete="email" /></div>
            <div className="password-label-row"><label className="login-label" htmlFor="password">Password</label><button type="button" className="login-text-link" onClick={() => setNotice("Password recovery is unavailable in demo mode because no real account is connected.")}>Forgot password?</button></div>
            <div className="login-input-wrap"><LockKeyhole size={16} /><input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Keep me signed in on this device</span></label>
            <button className="login-submit" type="submit">Continue in demo mode <ArrowRight size={16} /></button>
          </form>

          {notice && <p className="login-notice" role="status">{notice}</p>}
          <div className="login-divider"><span /> <small>DEMO ACCESS</small> <span /></div>
          <p className="demo-disclaimer">Entering creates a browser-local demo session only. These fields are not sent to a server and do not authenticate a real account.</p>
          <p className="signup-prompt">Need a real account? <button onClick={() => setNotice("Account creation is not enabled in this prototype. Contact your workspace administrator.")}>Create an account</button></p>
          <div className="login-secure-note"><LockKeyhole size={13} /> Real sign-in will be enabled when an authentication provider is configured.</div>
        </div>
        <footer className="login-footer"><span>© 2026 Dust2Farm</span><span>Farm monitoring and field operations</span></footer>
      </section>
    </main>
  );
}
