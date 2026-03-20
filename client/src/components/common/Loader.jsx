import { Loader2 } from "lucide-react";

const Loader = ({ fullscreen = false, size = 24, text = "" }) => {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-primary-600" />
        {text && <p className="text-sm text-gray-500">{text}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={size} className="animate-spin text-primary-600" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default Loader;