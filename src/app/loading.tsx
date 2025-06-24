"use client";

import Image from 'next/image';
import React from 'react';

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50"
             style={{backgroundColor: "#1A1919"}}>
            <div className="animate-pulse">
                <Image
                    src="/Logo Esteso.png"
                    alt="Caricamento in corso"
                    width={120}
                    height={120}
                    className="object-contain"
                />
            </div>
        </div>
    );
}