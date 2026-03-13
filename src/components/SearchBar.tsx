import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className }: SearchBarProps) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-xl mx-auto",
        className
      )}
    >
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
      <input
        type="text"
        placeholder="Search any city or neighborhood"
        className="w-full h-12 md:h-[52px] pl-12 pr-4 rounded-xl border border-border-light bg-white text-charcoal font-body text-[15px] placeholder:text-warm-gray focus:outline-none focus:border-sage transition-colors"
      />
    </div>
  );
};

export default SearchBar;
