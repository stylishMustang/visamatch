import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://heldcbqlhcgxzhcpgcsh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlbGRjYnFsaGNneHpoY3BnY3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NTIyMjAsImV4cCI6MjA1OTIyODIyMH0.7j6QqkZ8ZX2g_4npGnd3SGlNyTAC78rjdcu6CClEuyA',
);

function normalizeName(name: string | undefined | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[,\.]/g, '')
    .replace(/(llc|inc|corp|co|ltd|incorporated|corporation|limited)/g, '')
    .trim();
}

async function matchJobsToSponsors() {
  const { data: jobs, error: jobErr } = await supabase.from('jobs').select('*');
  const { data: sponsors, error: sponsorErr } = await supabase.from('visa_sponsors').select('*');

  if (jobErr || sponsorErr) {
    console.error('❌ Error loading data:', jobErr || sponsorErr);
    return;
  }

  for (const job of jobs!) {
    const normalizedCompany = normalizeName(job.company);
    const sponsorMatch = sponsors!.find(
      (s) =>
        (normalizeName(normalizedCompany).includes(normalizeName(s.employer_name)) ||
          normalizeName(s.employer_name).includes(normalizeName(normalizedCompany))) &&
        s.case_status.toLowerCase().includes('certified'),
    );

    const visaType = sponsorMatch?.visa_class ?? 'OPT';
    const visaVerified = !!sponsorMatch;
    console.log('sponsorMatch object:', sponsorMatch);
    console.log(`${job.company} → ${visaVerified ? `✅ ${visaType}` : '🎓 OPT fallback'}`);
    if (sponsorMatch) {
      console.log(
        `✅ Matched via partial: ${job.company} → ${sponsorMatch.employer_name} (${sponsorMatch.visa_class})`,
      );
    } else {
      console.log(`🎓 No match: ${job.company} → OPT fallback`);
    }

    await supabase
      .from('jobs')
      .update({
        visa_type: sponsorMatch?.visa_class ?? 'OPT',
        visa_verified: !!sponsorMatch,
      })
      .eq('id', job.id);
  }

  console.log('✅ Matching complete!');
}

matchJobsToSponsors();
