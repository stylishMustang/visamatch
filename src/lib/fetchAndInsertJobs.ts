// lib/jobSync.ts
import 'dotenv/config';
import { createClient, PostgrestResponse } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Define interfaces for better type safety
interface JSearchJob {
  employer_name: string;
  job_title: string;
  job_city: string | null;
  job_country: string | null;
  job_apply_link: string | null;
  // Add other relevant properties from JSearch API if needed
}

interface JSearchResponse {
  data?: JSearchJob[];
  // Add other response properties if they exist
}

interface Sponsor {
  employer_name: string;
  case_status: string;
  visa_class: string;
  // Add other relevant properties from visa_sponsors table
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Missing Supabase URL or Anon Key. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || '7766e51fb1mshc15fecf91f55a8ep1c839djsn575be77ff48d';
const JSEARCH_HOST = 'jsearch.p.rapidapi.com';
const LOCATION = 'United States';
const PAGES = 1; // You can bump this later

function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[,\.]/g, '')
    .replace(/(llc|inc|corp|co|ltd|incorporated|corporation|limited)/g, '')
    .trim();
}

async function fetchSponsors(): Promise<Sponsor[]> {
  const { data, error }: PostgrestResponse<Sponsor> = await supabase.from('visa_sponsors').select('*');
  if (error) throw new Error('Failed to fetch visa_sponsors: ' + error.message);
  return data || [];
}

async function fetchJobsFromJSearch(role: string): Promise<JSearchJob[]> {
  const allJobs: JSearchJob[] = [];
  for (let i = 1; i <= PAGES; i++) {
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role)}&page=${i}&num_pages=1&location=${encodeURIComponent(LOCATION)}`,
      {
        headers: {
          'X-RapidAPI-Key': JSEARCH_API_KEY,
          'X-RapidAPI-Host': JSEARCH_HOST,
        },
      },
    );
    const jsonResponse: JSearchResponse = (await res.json()) as JSearchResponse;
    if (jsonResponse.data) {
      allJobs.push(...jsonResponse.data);
    }
  }
  return allJobs;
}

export async function matchAndInsertJobs(role: string) {
  console.log(`🔍 Searching for jobs: "${role}"`);

  const sponsors = await fetchSponsors();
  console.log(`✅ Loaded ${sponsors.length} sponsors`);

  const jobs = await fetchJobsFromJSearch(role);
  console.log(`📦 Fetched ${jobs.length} jobs from JSearch`);

  if (jobs.length === 0) {
    console.warn('⚠️ No jobs returned. Check your query or API limit.');
    return;
  }

  for (const job of jobs) {
    const normalizedCompany = normalizeName(job.employer_name);
    const sponsorMatch = sponsors.find(
      (s: Sponsor) =>
        (normalizeName(s.employer_name).includes(normalizedCompany) ||
          normalizedCompany.includes(normalizeName(s.employer_name))) &&
        s.case_status.toLowerCase().includes('certified'),
    );

    const visa_type = sponsorMatch?.visa_class || 'OPT';
    const visa_verified = !!sponsorMatch;

    try {
      const { error } = await supabase.from('jobs').insert([
        {
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city || job.job_country,
          url: job.job_apply_link,
          salary: 0,
          visa_type,
          visa_verified,
        },
      ]);

      if (error) {
        console.error(`❌ Failed to insert job: ${job.job_title} @ ${job.employer_name}`, error);
      } else {
        console.log(
          `✅ Inserted: ${job.job_title} @ ${job.employer_name} ${job.job_apply_link || 'N/A'}→ ${visa_verified ? visa_type : '🎓 OPT fallback'}`,
        );
      }
    } catch (err) {
      console.error('🔥 Unexpected error inserting job:', err);
    }
  }

  console.log('🏁 Job import complete');
}
