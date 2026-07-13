document.addEventListener('DOMContentLoaded', () => {
    const USERNAME = 'IsmailTP';
    const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    
    const elements = {
        overview: document.getElementById('gh-stats-overview'),
        languages: document.getElementById('gh-languages-container'),
        topRepos: document.getElementById('gh-top-repos'),
        lastUpdated: document.getElementById('gh-last-updated'),
        errorMsg: document.getElementById('gh-error-msg')
    };

    if (!elements.overview) return;

    async function fetchGitHubData() {
        const cachedData = localStorage.getItem(`gh_data_${USERNAME}`);
        const cacheTime = localStorage.getItem(`gh_time_${USERNAME}`);
        
        if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime) < CACHE_DURATION)) {
            console.log('Using cached GitHub data');
            return JSON.parse(cachedData);
        }

        try {
            console.log('Fetching from GitHub API');
            const [profileRes, reposRes] = await Promise.all([
                fetch(`https://api.github.com/users/${USERNAME}`),
                fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`)
            ]);

            if (!profileRes.ok || !reposRes.ok) {
                if (profileRes.status === 403 || reposRes.status === 403) {
                    throw new Error('Rate limit exceeded');
                }
                throw new Error('Failed to fetch data');
            }

            const profile = await profileRes.json();
            const repos = await reposRes.json();

            const data = { profile, repos };
            
            localStorage.setItem(`gh_data_${USERNAME}`, JSON.stringify(data));
            localStorage.setItem(`gh_time_${USERNAME}`, Date.now().toString());
            
            return data;
        } catch (error) {
            console.error('GitHub API Error:', error);
            
            // Try to use expired cache as fallback
            if (cachedData) {
                console.log('Using expired cache as fallback');
                return JSON.parse(cachedData);
            }
            throw error;
        }
    }

    function processData(data) {
        const repos = data.repos.filter(repo => !repo.fork); // Exclude forks
        
        let totalStars = 0;
        let totalForks = 0;
        let securityProjects = 0;
        const languages = {};
        
        const securityKeywords = ['security', 'ctf', 'pentest', 'vulnerability', 'hack', 'exploit', 'malware'];
        
        repos.forEach(repo => {
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
            
            // Language counting
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + (repo.size || 1);
            }
            
            // Security projects
            const isSecurity = repo.topics?.some(topic => securityKeywords.includes(topic.toLowerCase())) ||
                               securityKeywords.some(kw => repo.name.toLowerCase().includes(kw) || (repo.description && repo.description.toLowerCase().includes(kw)));
            
            if (isSecurity) securityProjects++;
        });

        // Calculate language percentages
        const totalLangWeight = Object.values(languages).reduce((a, b) => a + b, 0);
        const topLanguages = Object.entries(languages)
            .map(([name, weight]) => ({
                name,
                percent: totalLangWeight > 0 ? ((weight / totalLangWeight) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5);
            
        // Top Repos
        const topRepos = [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3);
            
        // Recent Repo (first item in array since API sorts by updated)
        const recentRepo = data.repos.length > 0 ? data.repos[0] : null;

        return {
            totalRepos: data.profile.public_repos,
            totalStars,
            totalForks,
            securityProjects,
            topLanguages,
            topRepos,
            recentRepo,
            createdAt: new Date(data.profile.created_at).getFullYear()
        };
    }

    function renderUI(stats) {
        // Colors mapping for languages
        const langColors = {
            'JavaScript': '#f1e05a',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Python': '#3572A5',
            'Shell': '#89e051',
            'TypeScript': '#3178c6',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'PHP': '#4F5D95'
        };

        // Render Overview
        elements.overview.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="ph ph-book-bookmark"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.totalRepos}</span>
                    <span class="stat-label">Repositories</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="ph ph-star"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.totalStars}</span>
                    <span class="stat-label">Total Stars</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="ph ph-git-fork"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.totalForks}</span>
                    <span class="stat-label">Total Forks</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="ph ph-shield-check"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.securityProjects}</span>
                    <span class="stat-label">Security Projects</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="ph ph-file-pdf"></i></div>
                <div class="stat-info">
                    <span class="stat-value">12</span>
                    <span class="stat-label">Total Reports</span>
                </div>
            </div>
        `;

        // Render Languages
        if (stats.topLanguages.length > 0) {
            elements.languages.innerHTML = stats.topLanguages.map(lang => {
                const color = langColors[lang.name] || '#888888';
                return `
                    <div class="lang-item">
                        <div class="lang-info">
                            <span class="lang-name">
                                <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; display: inline-block;"></span>
                                ${lang.name}
                            </span>
                            <span class="lang-percent">${lang.percent}%</span>
                        </div>
                        <div class="lang-bar-bg">
                            <div class="lang-bar-fill" style="width: 0%; background-color: ${color};" data-width="${lang.percent}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Animate language bars
            setTimeout(() => {
                const bars = elements.languages.querySelectorAll('.lang-bar-fill');
                bars.forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            }, 100);
        } else {
            elements.languages.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No language data available.</p>';
        }

        // Render Top Repos
        if (stats.topRepos.length > 0) {
            elements.topRepos.innerHTML = stats.topRepos.map(repo => `
                <a href="${repo.html_url}" target="_blank" class="gh-repo-item">
                    <div class="gh-repo-name">
                        <i class="ph ph-book-bookmark"></i> ${repo.name}
                    </div>
                    ${repo.description ? `<div class="gh-repo-desc">${repo.description.substring(0, 80)}${repo.description.length > 80 ? '...' : ''}</div>` : ''}
                    <div class="gh-repo-stats">
                        ${repo.language ? `<span><span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${langColors[repo.language] || '#888'}; display: inline-block;"></span> ${repo.language}</span>` : ''}
                        <span><i class="ph ph-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="ph ph-git-fork"></i> ${repo.forks_count}</span>
                    </div>
                </a>
            `).join('');
        } else {
            elements.topRepos.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No repositories found.</p>';
        }

        // Render Footer
        elements.lastUpdated.innerHTML = `
            GitHub joined ${stats.createdAt} • 
            ${stats.recentRepo ? `Last updated: <a href="${stats.recentRepo.html_url}" target="_blank" style="color: var(--text-main); font-weight: 500; text-decoration: underline;">${stats.recentRepo.name}</a>` : ''}
        `;
    }

    async function init() {
        try {
            const data = await fetchGitHubData();
            const stats = processData(data);
            renderUI(stats);
        } catch (error) {
            elements.errorMsg.style.display = 'block';
            elements.errorMsg.innerHTML = '<i class="ph ph-warning-circle"></i> Failed to load GitHub statistics: ' + error.message;
            // Hide skeletons
            elements.overview.innerHTML = '<p style="color: var(--text-muted);">Data unavailable.</p>';
            elements.languages.innerHTML = '';
            elements.topRepos.innerHTML = '';
            elements.lastUpdated.innerHTML = '';
        }
    }

    // Use IntersectionObserver to start fetch only when section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                init();
                observer.disconnect(); // Only run once
            }
        });
    }, { threshold: 0.1 });

    const statsSection = document.getElementById('github-stats');
    if (statsSection) {
        observer.observe(statsSection);
    } else {
        init(); // Fallback if section ID isn't found
    }
});
