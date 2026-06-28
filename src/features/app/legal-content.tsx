import * as React from "react";
import { cn } from "@/lib/utils";

export const CONTACT_EMAIL = "heymachineni@gmail.com";
export const LEGAL_UPDATED = "June 28, 2026";

function LegalDoc({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0 pb-2">{children}</div>;
}

function LegalIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-b border-border pb-6 text-[15px] leading-[1.65] text-muted-fg">
      {children}
    </div>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5 border-b border-border py-6 last:border-b-0">
      <h3 className="text-[14px] font-semibold tracking-tight text-fg">
        {title}
      </h3>
      <div className="space-y-2.5 text-[15px] leading-[1.65] text-muted-fg">
        {children}
      </div>
    </section>
  );
}

function LegalNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-border pt-6 text-[13px] leading-relaxed text-faint-fg">
      {children}
    </p>
  );
}

const linkClass =
  "text-fg underline underline-offset-2 transition-opacity hover:opacity-80";

export function TermsContent() {
  return (
    <LegalDoc>
      <LegalIntro>
        <p className="text-[13px] text-faint-fg">
          Last updated: {LEGAL_UPDATED}
        </p>
        <p>
          Just Write is a simple writing app we are building because we wanted a
          calm place to put words down. These terms exist to be clear, not to
          bury you in legalese.
        </p>
        <p>
          Questions? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalIntro>

      <LegalSection title="Using Just Write">
        <p>
          Just Write is free. There are no subscriptions or payments in the app.
          You can open it, write on a page, and use it without signing in. If
          you sign in with email, your pages can sync to your account.
        </p>
        <p>
          Please use the app lawfully. Do not try to break it, scrape it at
          scale, or use it to harass anyone. Do not post or store illegal
          content through the service.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          If you choose to sign in, you need a valid email address. You are
          responsible for activity on your account and for keeping access to
          your inbox secure. Sign-in codes are sent to the email you provide.
        </p>
        <p>
          You can stop using Just Write at any time. If you want your cloud data
          removed after signing in, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Your writing">
        <p>
          You own what you write. Just Write does not claim your pages, notes, or
          drafts. You are responsible for the content you create.
        </p>
        <p>
          Without an account, your pages stay in your browser on your device.
          With an account, copies are stored in our cloud provider so you can
          sync across devices.
        </p>
      </LegalSection>

      <LegalSection title="What we are not responsible for">
        <p>
          Just Write is provided &ldquo;as is.&rdquo; We work to keep it running,
          but things can break, change, or go offline. We are not liable for
          lost work, so please keep backups of anything important.
        </p>
        <p>
          The app may link to other sites (for example, project pages). Those
          sites have their own terms and policies.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update Just Write or these terms. If we do, we will post the
          new version here with an updated date. Continued use of the app means
          you accept the current terms.
        </p>
      </LegalSection>

      <LegalNote>
        We are not lawyers, and this page may not be perfect. If something looks
        off, tell us.
      </LegalNote>
    </LegalDoc>
  );
}

export function PrivacyContent() {
  return (
    <LegalDoc>
      <LegalIntro>
        <p className="text-[13px] text-faint-fg">
          Last updated: {LEGAL_UPDATED}
        </p>
        <p>
          Just Write is a writing app. We collect as little as possible and we
          do not run ads.
        </p>
      </LegalIntro>

      <LegalSection title="Without an account">
        <p>
          Your pages are stored locally in your browser. We do not receive your
          writing unless you choose to sign in and sync.
        </p>
      </LegalSection>

      <LegalSection title="If you sign in">
        <p>
          We ask for your email address and send a one-time sign-in code. Email
          delivery is handled by Resend. Authentication and cloud storage use
          Google Firebase. Your pages sync to your account so you can access
          them on other devices.
        </p>
        <p>
          We do not sell your personal information. Service providers process
          data only to run sign-in and sync.
        </p>
      </LegalSection>

      <LegalSection title="What we do not do">
        <ul className={cn("list-disc space-y-2 pl-5")}>
          <li>No advertising networks</li>
          <li>No selling your email or your writing</li>
          <li>No tracking pixels for marketing</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          The app uses browser storage to save your pages, settings, and theme
          on your device. If you sign in, Firebase may use cookies or similar
          technology for authentication.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Just Write is not directed at children under 13. If you believe a
          child has given us personal information, contact us and we will delete
          it.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes, we will update this page and the date above.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about privacy?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
