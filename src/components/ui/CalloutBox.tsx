import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CalloutBoxProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  title?: string;
}

const CalloutBox = ({ children, icon: Icon = Info, title }: CalloutBoxProps) => {
  return (
    <div className="my-8 bg-cream rounded-xl border-l-4 border-sage px-5 py-4 flex gap-3">
      <Icon className="h-5 w-5 text-sage flex-shrink-0 mt-0.5" />
      <div>
        {title && (
          <p className="font-heading font-semibold text-[15px] text-charcoal mb-1">{title}</p>
        )}
        <div className="font-body text-[15px] text-charcoal leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export default CalloutBox;
