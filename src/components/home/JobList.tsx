import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import router from 'next/router';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  visa_type: string;
  visa_verified: boolean;
  salary: number;
  url: string;
};

export default function JobList() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobsToShow, setJobsToShow] = useState(3);
  const [userHasPaid, setUserHasPaid] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from('jobs').select('*');
      if (error) console.error('Error fetching jobs:', error);
      else setJobs(data || []);
    };

    fetchJobs();
  }, []);

  const filteredJobs = selectedVisa ? jobs.filter((job) => job.visa_type === selectedVisa) : jobs;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    setJobs([]); // Reset jobs before fetching new ones
    setLoading(true);

    const res = await fetch(`/api/fetch-jobs?role=${encodeURIComponent(searchTerm)}`);
    const result = await res.json();
    console.log(result.message || result.error);

    // Refetch jobs from the database after inserting the new ones
    const { data } = await supabase.from('jobs').select('*');
    setJobs(data || []);
    setLoading(false);
  };

  const handleShowMore = () => {
    setJobsToShow(jobsToShow + 10); // Add 10 more jobs when "Show More" is clicked
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search job title e.g. frontend developer"
            className="px-4 py-2 border rounded-md w-full max-w-md"
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-yellow-300 text-white rounded-md hover:bg-yellow-400"
            disabled={loading}
          >
            {loading ? 'Fetching...' : 'Search'}
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4">Visa-Sponsored Jobs</h2>

      {/* Filter by Visa Type */}
      <div className="mb-4 bg-red-70">
        <label htmlFor="visaFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Visa Type
        </label>
        <select
          id="visaFilter"
          onChange={(e) => setSelectedVisa(e.target.value || null)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-sm"
        >
          <option value="">All Visa Types</option>
          <option value="H-1B">🌎 H-1B</option>
          <option value="Green Card">🟢 Green Card</option>
          <option value="E-3">🇦🇺 E-3</option>
          <option value="TN">🇨🇦/🇲🇽 TN</option>
          <option value="H-1B1 Chile">🇨🇱 H-1B1</option>
          <option value="H-1B1 Singapore">🇸🇬 H-1B1</option>
          <option value="OPT">🎓 OPT</option>
          <option value="CPT">📚 CPT</option>
          <option value="J-1">📝 J-1</option>
        </select>
      </div>

      {/* Display jobs */}
      <div className="space-y-4">
        {filteredJobs.slice(0, jobsToShow).map((job) => (
          <a
            key={job.id}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border bg-[#000000] border-gray-200 rounded-xl shadow hover:bg-[#171717] transition"
          >
            <h3 className="text-lg font-semibold">
              {job.title} @ {job.company}
            </h3>

            {/* ✅ Visa Sponsor Tag */}
            {job.visa_verified ? (
              <span className="inline-block text-green-600 text-xs font-semibold">✅ {job.visa_type} Sponsor</span>
            ) : job.visa_type === 'OPT' ? (
              <span className="inline-block text-yellow-500 text-xs font-semibold">🎓 OPT Eligible</span>
            ) : null}

            <p className="text-sm text-gray-600">{job.location}</p>
          </a>
        ))}
      </div>

      {/* Show More Button */}
      {userHasPaid && jobsToShow < filteredJobs.length && (
        <div className="mt-4 text-center">
          <button
            onClick={handleShowMore}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Show More
          </button>
        </div>
      )}

      {/* Payment Button */}
      {!userHasPaid && filteredJobs.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/payment')} // Redirects to the payment page
            className="px-6 py-2 bg-green-600 text-white rounded-md"
          >
            Go to Payment Page
          </button>
        </div>
      )}
    </div>
  );
}
