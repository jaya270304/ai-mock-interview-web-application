import { cn } from "@/lib/utils";


interface ConatinerProps{
  children : React.ReactNode;
  className?: string;

}

export const Conatiner = ({children,className} : ConatinerProps) => {
  return (
    <div className={cn("container mx-auto px-4 md:px-8 py-4 w-full",className)}>
      {children}
    </div>
  );
};


