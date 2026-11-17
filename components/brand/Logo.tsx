import { ComponentProps, useId } from "react";
import { twMerge } from "tailwind-merge";

type LogoMarkProps = { size?: number } & Omit<ComponentProps<"svg">, "width" | "height">;

/** The Industra mark: a hex nut framing a steel I-beam. */
export const LogoMark = ({ size = 36, className, ...props }: LogoMarkProps) => {
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="Industra"
      className={twMerge("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id={`ind-${gid}`} x1="10" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <path
        d="M32 5 L55.4 18.5 V45.5 L32 59 L8.6 45.5 V18.5 Z"
        fill={`url(#ind-${gid})`}
        stroke={`url(#ind-${gid})`}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M21 18 H43 Q44.5 18 44.5 19.5 V22.5 Q44.5 24 43 24 H35 V40 H43 Q44.5 40 44.5 41.5 V44.5 Q44.5 46 43 46 H21 Q19.5 46 19.5 44.5 V41.5 Q19.5 40 21 40 H29 V24 H21 Q19.5 24 19.5 22.5 V19.5 Q19.5 18 21 18 Z"
        fill="#FFFFFF"
      />
      <path d="M35 24 H40 L35 29 Z" fill="#C7D2FE" />
      <path d="M29 40 H24 L29 35 Z" fill="#BAE6FD" />
    </svg>
  );
};

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
} & ComponentProps<"div">;

/** Mark + "Industra" wordmark. */
export const Logo = ({ size = 36, showWordmark = true, wordmarkClassName, className, ...props }: LogoProps) => (
  <div className={twMerge("flex items-center gap-2", className)} {...props}>
    <LogoMark size={size} />
    {showWordmark && (
      <span className={twMerge("font-bold tracking-tight text-xl", wordmarkClassName)}>
        Indus<span className="text-sky-500">tra</span>
      </span>
    )}
  </div>
);

export default Logo;
