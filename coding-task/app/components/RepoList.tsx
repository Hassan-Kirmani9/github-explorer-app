'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

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

async function fetchRepos(page: number, query: string = ''): Promise<GitHubResponse> {
    const searchTerm = query ? `${query} stars:>5000` : 'stars:>5000';
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchTerm)}&sort=stars&order=desc&per_page=30&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
}

export default function RepoList({
    initialData,
    initialPage,
    initialSearch,
}: {
    initialData: GitHubResponse;
    initialPage: number;
    initialSearch: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(initialPage);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    const { data, isLoading } = useQuery({
        queryKey: ['repos', page, searchQuery],
        queryFn: () => fetchRepos(page, searchQuery),
        initialData,
        staleTime: 60 * 1000,
    });

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('search') as string;
        setSearchQuery(query);
        setPage(1);
        if (query) {
            router.push(`/?search=${encodeURIComponent(query)}&page=1`);
        } else {
            router.push('/');
        }
        window.location.href = query ? `/?search=${encodeURIComponent(query)}&page=1` : '/';
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        if (searchQuery) params.set('search', searchQuery);
        router.push(`/?${params.toString()}`);
    };

    const repos = data?.items || [];
    const totalCount = data?.total_count || 0;
    const hasNextPage = page * 30 < totalCount && page < 34;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="text-6xl">🚀</span>
                    </div>
                    <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
                        GitHub Explorer
                    </h1>
                    <p className="text-xl text-purple-200">
                        Discover the most starred repositories on GitHub
                    </p>
                </div>

                {/* Search Bar - Modern glassmorphism style */}
                <form onSubmit={handleSearch} className="mb-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-2 border border-white/20 shadow-2xl">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <svg
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search repositories... (try 'react', 'python', 'tensorflow')"
                                        className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-lg"
                                        defaultValue={searchQuery}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Search
                                </button>
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setPage(1);
                                            router.push('/');
                                        }}
                                        className="px-6 py-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium backdrop-blur-sm"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {isLoading ? (
                    <div className="text-center py-32">
                        <div className="inline-block relative">
                            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                        <p className="mt-6 text-white text-xl font-medium">Loading amazing repositories...</p>
                    </div>
                ) : (
                    <div>
                        {/* Stats Bar */}
                        <div className="mb-6 flex items-center justify-between backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
                            <div className="text-white font-medium">
                                <span className="text-purple-300">Showing {repos.length}</span> of{' '}
                                <span className="text-pink-300 font-bold">{totalCount.toLocaleString()}</span> repositories
                            </div>
                            <div className="text-white/60 text-sm">
                                Page {page} of {Math.min(34, Math.ceil(totalCount / 30))}
                            </div>
                        </div>

                        {/* Repository Grid */}
                        <div className="grid gap-6 mb-10">
                            {repos.map((repo) => (
                                <div
                                    key={repo.id}
                                    className="group backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                                >
                                    <div className="flex items-start gap-5">
                                        <img
                                            src={repo.owner.avatar_url}
                                            alt={repo.owner.login}
                                            className="w-16 h-16 rounded-2xl border-2 border-purple-400/50 group-hover:border-pink-400 transition-all duration-300 shadow-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-2xl font-bold text-white mb-2 truncate group-hover:text-purple-300 transition-colors">
                                              <a  
                                                    href={repo.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {repo.name}
                                                </a>
                                            </h2>
                                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                <span className="text-purple-200 text-sm">
                                                    by <span className="font-bold text-white">{repo.owner.login}</span>
                                                </span>
                                                {repo.language && (
                                                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white text-xs font-bold rounded-full border border-purple-400/30">
                                                        {repo.language}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                                                {repo.description || 'No description available'}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm">
                                                <span className="flex items-center gap-2 font-bold text-yellow-300">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {repo.stargazers_count.toLocaleString()}
                                                </span>
                                              <a  
                                                    href={repo.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-purple-300 hover:text-pink-300 font-bold transition-colors group/link"
                                                >
                                                    View on GitHub
                                                    <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-4 flex-wrap">
                            <button
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-bold border border-white/20 hover:scale-105 disabled:hover:scale-100"
                            >
                                ← Previous
                            </button>
                            <span className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg">
                                Page {page} of {Math.min(34, Math.ceil(totalCount / 30))}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={!hasNextPage}
                                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-bold border border-white/20 hover:scale-105 disabled:hover:scale-100"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}