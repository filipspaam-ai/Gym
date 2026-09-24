// Hand-drawn 24×24 stroke icons. `size` and `className` pass through; color follows currentColor.

const base = (children, { fill = false } = {}) =>
  function Icon({ size = 20, className, strokeWidth = 2, ...rest }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill ? "currentColor" : "none"}
        stroke={fill ? "none" : "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        {children}
      </svg>
    );
  };

export const Zap = base(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />);
export const Dumbbell = base(<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />);
export const Chart = base(<><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 6-7" /></>);
export const Apple = base(<><path d="M12 7.5c-1.6-1.2-5.2-1.4-6.6 1.6-1.3 2.9-.4 7.2 1.8 9.7 1.4 1.6 3 1.9 4.8 1 1.8.9 3.4.6 4.8-1 2.2-2.5 3.1-6.8 1.8-9.7-1.4-3-5-2.8-6.6-1.6z" /><path d="M12 7.5c0-2.2 1.2-4 3.3-4.5" /></>);
export const Book = base(<><path d="M2 4.5h6a4 4 0 0 1 4 4V21a3 3 0 0 0-3-3H2z" /><path d="M22 4.5h-6a4 4 0 0 0-4 4V21a3 3 0 0 1 3-3h7z" /></>);
export const Play = base(<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" />, { fill: true });
export const Pause = base(<><rect x="6" y="4" width="4" height="16" rx="1.2" /><rect x="14" y="4" width="4" height="16" rx="1.2" /></>, { fill: true });
export const Check = base(<path d="M20 6 9 17l-5-5" />);
export const X = base(<path d="M18 6 6 18M6 6l12 12" />);
export const ChevronRight = base(<path d="m9 18 6-6-6-6" />);
export const ChevronLeft = base(<path d="m15 18-6-6 6-6" />);
export const ChevronDown = base(<path d="m6 9 6 6 6-6" />);
export const Plus = base(<path d="M12 5v14M5 12h14" />);
export const Minus = base(<path d="M5 12h14" />);
export const Timer = base(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9.5 2h5" /></>);
export const Flame = base(<path d="M12 22c4 0 7-2.9 7-7 0-3.2-2-5.8-3.6-7.3.1 2.1-1 3.6-2.4 3.6-1.2 0-2-1-2-2.6C11 6.3 10 4 8 2c.3 4.4-3 6.8-3 12.2C5 18.6 8 22 12 22z" />);
export const Trophy = base(<><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3v1.5a3.5 3.5 0 0 1-3.5 3.5M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10" /></>);
export const Moon = base(<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z" />);
export const Sun = base(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const Droplet = base(<path d="M12 2.8S6 9.1 6 14.1a6 6 0 0 0 12 0c0-5-6-11.3-6-11.3z" />);
export const Download = base(<path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />);
export const Upload = base(<path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />);
export const Trash = base(<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2l1-12M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />);
export const Skip = base(<><path d="M5 4.5 15 12 5 19.5z" /><path d="M19 5v14" /></>);
export const Sparkle = base(<path d="M12 3.5 13.8 9l5.7 1.9-5.7 1.9L12 18.5l-1.8-5.7-5.7-1.9L10.2 9z" />);
export const TrendUp = base(<><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>);
export const Scale = base(<><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M7.8 9.5a6 6 0 0 1 8.4 0" /><path d="m12 11.5 1.5-2" /></>);
export const Activity = base(<path d="M22 12h-4l-3 8L9 4l-3 8H2" />);
export const Info = base(<><circle cx="12" cy="12" r="9" /><path d="M12 16v-4.5M12 8h.01" /></>);
export const Refresh = base(<><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8.5" /><path d="M21 3v5.5h-5.5" /><path d="M21 12a9 9 0 0 1-15.5 6.2L3 15.5" /><path d="M3 21v-5.5h5.5" /></>);
export const Target = base(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>);
export const Smartphone = base(<><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M11 18h2" /></>);
export const Stretch = base(<><circle cx="13" cy="4" r="2" /><path d="m4 20 5-4 1-5 4 2 5-3" /><path d="m10 11 1-4 4 1" /><path d="M9 16l3 4" /></>);
