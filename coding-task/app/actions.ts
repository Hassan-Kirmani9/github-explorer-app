'use server';

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

export async function fetchReposServer(page: number = 1, query: string = ''): Promise<GitHubResponse> {
  const searchTerm = query ? `${query} stars:>5000` : 'stars:>5000';
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchTerm)}&sort=stars&order=desc&per_page=30&page=${page}`;
  
  const response = await fetch(url, {
    next: { revalidate: 60 } // ISR: revalidate every 60 seconds
  });
  
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
} 