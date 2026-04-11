'use client';

import Link from 'next/link';
import Typing from '@/components/typing';
import Image from 'next/image';

export default function Page(): React.ReactElement {
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-zinc-900/70 p-8 md:p-12 text-zinc-100 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col items-center gap-8 md:gap-10">
          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-20 h-20 flex items-center justify-center">
              <Image
                src="/logo/mfclogo.svg"
                alt="Billing"
                width={80}
                height={80}
                className="object-contain max-w-full max-h-full"
                style={{ width: "auto", height: "80px" }}
              />
            </div>
            <div className="hidden md:block">
              <p className="text-2xl font-bold">Billing</p>
            </div>
          </div>

          {/* Typing Animation */}
          <div className="w-full flex justify-center relative z-10">
            <Typing />
          </div>

          {/* Info & Login */}
          <div className="w-full max-w-sm relative z-10">
            <h2 className="text-lg font-semibold">Manager Tools</h2>
            <p className="text-neutral-300 mt-2 text-sm">
              Streamlined tools for sales, collections, and ledgers. Manager
              access only.
            </p>
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="relative z-[1000] inline-block text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors cursor-pointer"
              >
                Manager Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
