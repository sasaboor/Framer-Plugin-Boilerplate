import Button from "./button";
import { ChevronLeft } from "lucide-react";
import { useNavigation } from "../navigation/useNavigation";

export interface AppBarProps {
  title: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
}

export default function AppBar({ title, actions, showBackButton = true }: AppBarProps) {
  const navigation = useNavigation();

  return (
    <header className="sticky top-0 z-20 px-4 h-[3rem] flex items-center gap-3 bg-[var(--framer-color-bg)] border-b border-[var(--framer-color-divider)]">
      {showBackButton && navigation.canGoBack() && (
        <Button onClick={navigation.goBack} size="icon" variant="secondary">
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}
      <h4 className="flex-1 text-sm font-semibold text-[var(--framer-color-text-primary)]">
        {title}
      </h4>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
