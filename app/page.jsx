'use client';
// Next.js App Router: this is the "/" route.
// We render the full SPA shell here (Navbar + page content).
// React Router is replaced by Next.js file-based routing —
// each page lives in app/<route>/page.jsx.

import Navbar from '@/components/layout/Navbar';
import LandingPage from '@/components/pages/LandingPage';

export default function Home() {
  return (
    <>
      <Navbar />
      <LandingPage />
    </>
  );
}
