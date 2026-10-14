'use client';
import {usePathname} from 'next/navigation';
export const useRoutePath=()=>usePathname() || '/en';
