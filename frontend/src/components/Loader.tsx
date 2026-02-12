import { Loader2 } from "lucide-react";

const Loader = () => (
  <div className="flex h-full min-h-[200px] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default Loader;
