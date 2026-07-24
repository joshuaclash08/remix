'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

export function MobileDeviceContainer({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-stretch">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col relative border-x border-slate-100 shadow-xs">
        {children}
      </div>
    </div>
  );
}
