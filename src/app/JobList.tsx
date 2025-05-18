'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobsToShow, setJobsToShow] = useState(3);
  const [userHasPaid] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem('jobs'); // Clear cached jobs on page load or refresh
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true); // Set loading to true while fetching jobs
      const { data, error } = await supabase.from('jobs').select('*');
      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        setJobs(data || []);
      }
      setLoading(false); // Set loading to false once jobs are fetched
    };

    fetchJobs();
  }, [supabase]);

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
    const { data, error } = await supabase.from('jobs').select('*');
    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      // Safely check if data is not null and prepend the jobs
      setJobs((prevJobs) => (data ? [...data, ...prevJobs] : prevJobs));
    }

    setLoading(false);
  };

  const handleShowMore = () => {
    setJobsToShow(jobsToShow + 10); // Add 10 more jobs when "Show More" is clicked
  };

  const handleRedirect = () => {
    router.push('/newPage');
  };

  return (
    <>
      <div className="p-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="sticky-header flex items-center sticky top-0 z-10 p-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search job title e.g. frontend developer"
              className="px-4 py-2 border rounded-md w-full max-w-md"
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-purple-300 text-white rounded-md hover:bg-purple-400"
              disabled={loading}
            >
              {loading ? 'Fetching...' : 'Search'}
            </button>
          </div>
        </form>
        <div />
        <h2 className="text-2xl font-bold mb-4">Visa-Sponsored Jobs</h2>

        {/* Filter by Visa Type */}
        <div className="sticky mb-4 bg-red-70">
          <label htmlFor="visaFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Visa Type
          </label>
          <div className="flex flex-wrap gap-2 sticky top-1 p-4">
            <button
              onClick={() => setSelectedVisa(null)}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === null ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              All Visa Types
            </button>
            <button
              onClick={() => setSelectedVisa('H-1B')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'H-1B' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              🌎 H-1B
            </button>
            <button
              onClick={() => setSelectedVisa('Green Card')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'Green Card' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              🟢 Green Card
            </button>
            <button
              onClick={() => setSelectedVisa('E-3')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'E-3' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              🇦🇺 E-3
            </button>
            <button
              onClick={() => setSelectedVisa('TN')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'TN' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              🇨🇦/🇲🇽 TN
            </button>
            <button
              onClick={() => setSelectedVisa('H-1B1 Chile')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'H-1B1 Chile' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              🇨🇱 H-1B1
            </button>
            <button
              onClick={() => setSelectedVisa('H-1B1 Singapore')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'H-1B1 Singapore' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              🇸🇬 H-1B1
            </button>
            <button
              onClick={() => setSelectedVisa('OPT')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'OPT' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              🎓 OPT
            </button>
            <button
              onClick={() => setSelectedVisa('CPT')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'CPT' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              📚 CPT
            </button>
            <button
              onClick={() => setSelectedVisa('J-1')}
              className={`px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-in-out transform ${selectedVisa === 'J-1' ? 'border-2 border-green-500 text-green-500' : ''}`}
            >
              📝 J-1
            </button>
          </div>
        </div>
      </div>
      {/* Display jobs */}
      <div className="p-7">
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
              onClick={handleRedirect} // Correctly calls the handleRedirect function
              className="px-6 py-2 bg-green-600 text-white rounded-md"
            >
              Go to Payment Page
            </button>
          </div>
        )}
      </div>
    </>
  );
}
