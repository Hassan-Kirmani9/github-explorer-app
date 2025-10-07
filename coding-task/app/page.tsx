import { Suspense } from 'react';
import RepoList from './components/RepoList';

interface Repository {
  id: number;
  name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  description: string;
  html_url: string;
  language: string;
}

interface GitHubResponse {
  items: Repository[];
  total_count: number;
}

async function fetchRepos(page: number = 1, query: string = ''): Promise<GitHubResponse> {
  const searchTerm = query ? `${query} stars:>5000` : 'stars:>5000';
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchTerm)}&sort=stars&order=desc&per_page=30&page=${page}`;
  
  const response = await fetch(url, {
    next: { revalidate: 60 }
  });
  
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

export const dynamic = 'force-dynamic';

export default async function Home(props: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  
  const initialData = await fetchRepos(page, search);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <RepoList initialData={initialData} initialPage={page} initialSearch={search} />
    </Suspense>
  );
}