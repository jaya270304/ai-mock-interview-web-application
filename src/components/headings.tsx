import { cn } from "@/lib/utils";

interface HeadingsProps {
  title: string;
  description?: string;
  isSubHeading?: boolean;
  className?: string;
}

export const Headings = ({ 
  title, 
  description, 
  isSubHeading = false,
  className 
}: HeadingsProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 
        className={cn(
          "font-bold tracking-tight",
          isSubHeading 
            ? "text-2xl md:text-3xl" 
            : "text-3xl md:text-4xl"
        )}
      >
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-sm md:text-base">
          {description}
        </p>
      )}
    </div>
  );
};
