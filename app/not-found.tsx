import Link from "next/link";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { CockPigeonIcon } from "@/components/ui/icons/CockPigeonIcon";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
          <CockPigeonIcon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">
            404 - Page Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or record you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
          </Link>
          <Link
            href="/pigeons"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Pigeon Registry
          </Link>
        </div>
      </div>
    </div>
  );
}
