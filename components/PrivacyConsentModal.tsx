'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Checkbox, CircularProgress, Dialog, FormControlLabel, LinearProgress, useMediaQuery } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import '@/styles/customscroll.css';
import { enqueueSnackbar } from 'notistack';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export type PrivacyConsentModalProps = {
  open: boolean;
  /** Called when the person agrees. Persist consent here (server action, then refetch). */
  onAccept: () => Promise<void> | void;
  showAccept?: boolean;
  showDecline?: boolean;
  acceptText?: string;
  declineText?: string;
  /** Optional. When provided, a "Decline" button is shown (for example, to sign the person out). */
  onDecline?: () => void;
  orgName: string;
  appName?: string;
  /** Organization primary colour, for example from useSettings().primaryColour */
  primaryColour?: string;
  contactEmail?: string;
  policyVersion?: string;
  effectiveDate?: string;
};

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';

const P = ({ children }: { children: ReactNode }) => (
  <p className="mb-3 text-[0.95rem] leading-7 text-slate-700 dark:text-slate-300">{children}</p>
);

const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="mb-3 space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3 text-[0.95rem] leading-7 text-slate-700 dark:text-slate-300">
        <span className="mt-[0.72rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--pc)' }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const tint = (pct: number) => `color-mix(in srgb, var(--pc) ${pct}%, transparent)`;

const CAN_SEE = [
  { name: 'Users', detail: 'Name, email, phone number, address, photo, department and assigned roles.' },
  { name: 'Roles', detail: 'Role names, descriptions and permission levels.' },
  { name: 'Organization record', detail: 'Name, address, phone number, email, website, logo, colours and application name.' },
];

const NEVER_SEE = [
  'Production',
  'Packaging',
  'Batches',
  'Goods',
  'Raw materials',
  'Storage',
  'Sales',
  'Orders',
  'Returns',
  'Finance',
  'Customers',
  'Suppliers',
  'Employees',
  'Labourers',
  'Departments',
  'Equipment',
  'Alerts',
];

function AccessLedger() {
  return (
    <div className="my-5 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border p-5" style={{ borderColor: tint(40), background: tint(8) }}>
        <div className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <VisibilityOutlinedIcon fontSize="small" style={{ color: 'var(--pc)' }} />
          What Sesa Tech can see
        </div>
        <dl className="space-y-3.5">
          {CAN_SEE.map((row) => (
            <div key={row.name}>
              <dt className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.name}</dt>
              <dd className="text-sm leading-6 text-slate-600 dark:text-slate-400">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-white/5">
        <div className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <VisibilityOffOutlinedIcon fontSize="small" className="text-slate-500" />
          What Sesa Tech never sees
        </div>
        <div className="flex flex-wrap gap-2">
          {NEVER_SEE.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-transparent dark:text-slate-300"
            >
              <LockOutlinedIcon sx={{ fontSize: 13 }} />
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Policy content                                                            */
/* -------------------------------------------------------------------------- */

type Section = { id: string; title: string; body: ReactNode };

function buildSections(orgName: string, contact: string): Section[] {
  return [
    {
      id: 'overview',
      title: 'Overview',
      body: (
        <>
          <P>
            Industra is operated by Sesa Tech. {orgName} uses Industra to run its own industrial operations, and the
            information {orgName} enters belongs to {orgName}. This policy explains in plain language what Sesa Tech can
            see, why, and which protections apply.
          </P>
          <P>
            The short version: Sesa Tech looks at only three things, your organization record, your users and your
            roles, and only to set up your organization and hand it over to your Global Admin. We do not look at
            anything else you store.
          </P>
        </>
      ),
    },
    {
      id: 'responsibility',
      title: 'Who is responsible for what',
      body: (
        <>
          <P>
            Under data protection law, the organization that decides why and how personal information is used is called
            the data controller. A business that handles information on the controller’s behalf is called a data
            processor.
          </P>
          <List
            items={[
              <>{orgName} is the data controller for the information it and its users enter into Industra.</>,
              <>
                Sesa Tech is the data processor. We host the platform, keep it running, and act only on the
                organization’s instructions and within the limits of this policy.
              </>,
              <>
                The organization record is created and managed by Sesa Tech during onboarding. Sesa Tech and the
                organization share responsibility for it, and the organization may edit it at any time.
              </>,
            ]}
          />
        </>
      ),
    },
    {
      id: 'access',
      title: 'What Sesa Tech can access',
      body: (
        <>
          <P>Our access is deliberately narrow. It covers these records and nothing more:</P>
          <AccessLedger />
          <P>We use this access for three reasons only:</P>
          <List
            items={[
              'To add the first user of an organization we onboard.',
              'To assign that user the Global Admin role, so they can take over and manage the organization themselves.',
              'To create and manage the organization record on the platform.',
            ]}
          />
          <P>
            Once your Global Admin is in place, Sesa Tech does not use user or role information for any other purpose.
          </P>
        </>
      ),
    },
    {
      id: 'never',
      title: 'What we never access',
      body: (
        <>
          <P>
            Everything else stays with your organization. Sesa Tech does not read, export, copy, analyse, sell or share
            your operational records, including the tables listed above.
          </P>
          <P>
            Global Admin is a role, not a data table. Holding it gives your administrator full control inside your
            organization. It does not give Sesa Tech any access to your records.
          </P>
        </>
      ),
    },
    {
      id: 'held',
      title: 'Information held on the platform',
      body: (
        <>
          <List
            items={[
              'Users: name, email, phone number, address, photo, department and assigned roles.',
              'Roles: role names, descriptions and permission levels.',
              'Organization: name, address, phone number, email, website, logo, brand colours and application name.',
              'Operational records: the production, packaging, sales, finance, supplier, customer, stock and workforce records your team creates. These stay private to your organization.',
            ]}
          />
          <P>
            Please enter only information you are entitled to share, and tell your users how their details are used.
          </P>
        </>
      ),
    },
    {
      id: 'use',
      title: 'How information is used',
      body: (
        <>
          <List
            items={[
              'To provide, secure and maintain Industra for your organization.',
              'To onboard your organization and its first user, as described above.',
              'To meet legal obligations that apply to us.',
            ]}
          />
          <P>
            We do not sell personal information. We do not use it for advertising, profiling, or any purpose unrelated
            to running Industra for you.
          </P>
        </>
      ),
    },
    {
      id: 'law',
      title: 'Legal basis and standards',
      body: (
        <>
          <P>
            Sesa Tech handles personal information in line with the Data Protection Act, 2012 (Act 843) of Ghana. Where
            the General Data Protection Regulation (GDPR) applies, for example because a user is in the European
            Economic Area, we follow its principles as well.
          </P>
          <List
            items={[
              'Lawfulness, fairness and transparency: we explain what we do and have a valid reason for doing it.',
              'Purpose limitation: information is used only for the reasons stated here.',
              'Data minimisation: we access the least information needed, which is why our access stops at three categories.',
              'Accuracy: information can be corrected at any time.',
              'Storage limitation: information is kept only as long as it is needed.',
              'Integrity and confidentiality: information is protected against loss, misuse and unauthorised access.',
              'Accountability: we can show how we comply, including through your recorded consent.',
            ]}
          />
          <P>
            Our security practices are designed around the controls of the International Organization for
            Standardization and International Electrotechnical Commission (ISO/IEC) 27001 standard for information
            security management. This describes our approach and is not a certification claim.
          </P>
        </>
      ),
    },
    {
      id: 'security',
      title: 'How we protect information',
      body: (
        <List
          items={[
            'Information travels over encrypted connections using Transport Layer Security (TLS).',
            'Sign in sessions are kept in encrypted cookies.',
            'Inside Industra, Role Based Access Control (RBAC) means each person sees only what their role allows.',
            'Each organization’s information is kept separate from every other organization’s.',
            'Sesa Tech access is limited to authorised developers and to the three categories described above.',
            'Information is stored in managed MongoDB databases with access restricted to the platform.',
          ]}
        />
      ),
    },
    {
      id: 'sharing',
      title: 'Sharing and transfers',
      body: (
        <>
          <P>
            We do not sell or rent information, and we do not share it with other organizations. We rely on trusted
            infrastructure providers, such as hosting and database services, to run Industra. They process information
            only to provide those services and are bound by confidentiality obligations.
          </P>
          <P>
            We may disclose information when the law requires it, and we limit any disclosure to what is required. If
            information is processed outside Ghana, we apply safeguards that give it protection equal to the standards
            in this policy.
          </P>
        </>
      ),
    },
    {
      id: 'retention',
      title: 'Retention and deletion',
      body: (
        <P>
          Information is kept while your organization uses Industra. When your organization stops using the platform, it
          may ask us to delete or return its information. We will do so within a reasonable period, unless the law
          requires us to keep something.
        </P>
      ),
    },
    {
      id: 'rights',
      title: 'Your rights',
      body: (
        <>
          <P>Every person whose information is held on Industra has the right to:</P>
          <List
            items={[
              'Ask what information is held about them and receive a copy.',
              'Have inaccurate information corrected.',
              'Have information erased when there is no longer a reason to keep it.',
              'Object to, or ask us to restrict, certain uses of their information.',
              'Receive their information in a common format and move it elsewhere.',
              'Withdraw consent at any time. This does not affect anything done before withdrawal.',
            ]}
          />
          <P>
            Users should first contact their organization’s Global Admin, who controls their records. You can also
            write to us at {contact}. If you are not satisfied, you may complain to the Data Protection Commission of
            Ghana.
          </P>
        </>
      ),
    },
    {
      id: 'breach',
      title: 'If something goes wrong',
      body: (
        <P>
          If we become aware of a breach that puts personal information at risk, we will tell the affected organization
          without undue delay, and within 72 hours where we are able to. That allows the organization to meet its own
          duties to the Data Protection Commission and to the people affected. Our notice will explain what happened,
          what information was involved, and what we are doing about it.
        </P>
      ),
    },
    {
      id: 'changes',
      title: 'Changes and contact',
      body: (
        <>
          <P>
            We will update this policy when our practices or the law change. When a change is material, we will ask for
            consent again before you continue. The version and date appear at the top of this window.
          </P>
          <P>Questions or requests can be sent to {contact}.</P>
          <P>
            By agreeing, you confirm that you are authorised to accept this policy on behalf of {orgName}.
          </P>
        </>
      ),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Modal                                                                     */
/* -------------------------------------------------------------------------- */

export default function PrivacyConsentModal({
  open,
  onAccept,
  showAccept,
  showDecline,
  acceptText = 'I agree and continue',
  declineText = 'Decline',
  onDecline,
  orgName,
  appName = 'Industra',
  primaryColour,
  contactEmail,
  policyVersion = '1.0',
  effectiveDate = '20 October 2026',
}: PrivacyConsentModalProps) {
  const fullScreen = useMediaQuery('(max-width:767px)');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [progress, setProgress] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [activeId, setActiveId] = useState('overview');
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const contact = contactEmail || 'the Sesa Tech support team';
  const sections = useMemo(() => buildSections(orgName, contact), [orgName, contact]);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const p = max <= 0 ? 1 : el.scrollTop / max;
    setProgress(p);
    if (p >= 0.985) setReachedEnd(true);

    let current = sections[0].id;
    for (const s of sections) {
      const node = sectionRefs.current[s.id];
      if (node && node.offsetTop <= el.scrollTop + 140) current = s.id;
    }
    setActiveId(current);
  }, [sections]);

  // Measure once the dialog has mounted (content may already fit without scrolling)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(measure, 80);
    return () => clearTimeout(t);
  }, [open, measure]);

  const goTo = (id: string) => {
    const el = scrollRef.current;
    const node = sectionRefs.current[id];
    if (!el || !node) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ top: node.offsetTop - 16, behavior: reduce ? 'auto' : 'smooth' });
  };

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await onAccept();
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error occured while accepting the policy', {variant:'error'});
    }
    finally {
      setSubmitting(false);
    }
  };

  const canAccept = reachedEnd && checked && !submitting;
  const pc = primaryColour || '#0F6B5C';

  return (
    <Dialog
      open={open}
      onClose={() => {
        /* Consent is required, so the backdrop and Escape do not close the dialog */
      }}
      disableEscapeKeyDown
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
      aria-labelledby="privacy-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : '20px',
            height: fullScreen ? '100%' : 'min(88vh, 860px)',
            overflow: 'hidden',
            backgroundImage: 'none',
          },
        },
      }}
    >
      <div
        className="flex h-full flex-col bg-white text-slate-900 dark:bg-[#0F1214] dark:text-slate-100"
        style={{ '--pc': pc } as CSSProperties}
      >
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 md:px-8">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: 'var(--pc)' }}
          >
            <ShieldOutlinedIcon />
          </span>
          <div className="min-w-0">
            <h1
              id="privacy-title"
              className="truncate text-xl font-semibold leading-tight md:text-2xl"
              style={{ fontFamily: SERIF }}
            >
              Privacy and data protection policy
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {appName} for {orgName}. Version {policyVersion}, effective {effectiveDate}.
            </p>
          </div>
        </header>

        {/* Reading progress */}
        <LinearProgress
          variant="determinate"
          value={Math.min(progress * 100, 100)}
          sx={{
            height: 3,
            backgroundColor: tint(12),
            '& .MuiLinearProgress-bar': { backgroundColor: 'var(--pc)', transition: 'transform 120ms linear' },
          }}
          aria-label="Reading progress"
        />

        {/* Body */}
        <div className="grid min-h-0 flex-1 md:grid-cols-[250px_1fr]">
          {/* Section rail */}
          <nav
            aria-label="Policy sections"
            className="hidden overflow-y-auto border-r border-slate-200 px-4 py-6 dark:border-slate-800 md:block scrollbar-custom"
          >
            <ul className="space-y-0.5">
              {sections.map((s) => {
                const active = s.id === activeId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(s.id)}
                      className="w-full rounded-lg border-l-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/5"
                      style={{
                        borderLeftColor: active ? 'var(--pc)' : 'transparent',
                        color: active ? 'var(--pc)' : undefined,
                        fontWeight: active ? 600 : 400,
                        outlineColor: 'var(--pc)',
                      }}
                      aria-current={active ? 'true' : undefined}
                    >
                      {s.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Policy text */}
          <div
            ref={scrollRef}
            onScroll={measure}
            tabIndex={0}
            aria-label="Policy text"
            className="relative min-h-0 overflow-y-auto scroll-smooth px-6 py-8 focus:outline-none md:px-12 scrollbar-custom"
          >
            <div className="mx-auto max-w-[44rem]">
              {sections.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  ref={(node) => {
                    sectionRefs.current[s.id] = node;
                  }}
                  className="mb-10"
                >
                  <h2 className="mb-3 text-[1.4rem] font-semibold leading-snug" style={{ fontFamily: SERIF }}>
                    {s.title}
                  </h2>
                  {s.body}
                </section>
              ))}
              <div className="h-4" />
            </div>
          </div>
        </div>

        {/* Consent footer */}
        <footer
          className="border-t border-slate-200 px-6 py-4 dark:border-slate-800 md:px-8"
          style={{ background: tint(5) }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {
                showAccept &&
                <div>
                <FormControlLabel
                    disabled={!reachedEnd}
                    control={
                    <Checkbox
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        sx={{ '&.Mui-checked': { color: 'var(--pc)' } }}
                    />
                    }
                    label={
                    <span className="text-sm leading-snug">
                        I have read this policy and I consent to it on behalf of {orgName}.
                    </span>
                    }
                />
                {!reachedEnd && (
                    <p className="ml-8 text-xs text-slate-500 dark:text-slate-400">
                    Scroll to the end of the policy to unlock this option.
                    </p>
                )}
                </div>
            }

            <div className="flex items-center justify-end gap-2">
              {showDecline && (
                <Button onClick={onDecline} disabled={submitting} sx={{ color: 'text.secondary', backgroundColor:'var(--pc)', textTransform: 'none' }}>
                  {declineText}
                </Button>
              )}
              {
                showAccept &&
                <Button
                    variant="contained"
                    disableElevation
                    disabled={!canAccept}
                    onClick={handleAccept}
                    startIcon={
                    submitting ? <CircularProgress size={16} color="inherit" /> : <CheckRoundedIcon fontSize="small" />
                    }
                    sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',
                    px: 3,
                    py: 1.1,
                    backgroundColor: 'var(--pc)',
                    '&:hover': { backgroundColor: 'var(--pc)', filter: 'brightness(0.92)' },
                    '&.Mui-disabled': { backgroundColor: tint(25), color: 'rgba(255,255,255,0.8)' },
                    }}
                >
                    {acceptText}
                </Button>
              }
            </div>
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
