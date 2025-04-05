'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';
import '../../../styles/home-page.css'; // Ensure this file is properly imported
import { LocalizationBanner } from '@/components/home/header/localization-banner';
import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { Pricing } from '@/components/home/header/Pricing';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';
import JobList from './JobList';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/logout/actions';

export function HomePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  const [country, setCountry] = useState('US');
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {' '}
      {/* Ensures full height of the screen */}
      <LocalizationBanner country={country} onCountryChange={setCountry} />
      <div className="flex-grow">
        <HomePageBackground />
        <Header user={user} />
        <form action={logout}>
          <button type="submit"> LOGOUT</button>
        </form>

        <HeroSection />
        <div className="mx-auto max-w-7xl px-[0px] relative flex items-center justify-between mt-120 mb-120">
          <div className="job-list-container">
            <JobList />
          </div>
        </div>
        {/* <Pricing country={country} /> */}
      </div>
      <div className="footer mt-300">
        {' '}
        {/* Add margin-top to give space before footer */}
        <Footer />
      </div>
    </div>
  );
}
