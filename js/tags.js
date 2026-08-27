// Tags filtering for CaptainGimpy's blog
(function() {
    // Extract unique tags from article cards
    function getAllTags() {
        const cards = document.querySelectorAll('.article-card');
        const tagSet = new Set();
        cards.forEach(card => {
            const tags = card.dataset.tags?.split(' ') || [];
            tags.forEach(t => tagSet.add(t));
        });
        return Array.from(tagSet).sort();
    }
    
    // Map of tag to display name
    const tagLabels = {
        'hermes': 'Hermes',
        'ai-models': 'AI Models',
        'obsidian': 'Obsidian',
        'windows': 'Windows',
        'hosting': 'Hosting',
        'blender': 'Blender',
        'accessibility': 'Accessibility',
        'vibe-coding': 'Vibe‑Coding',
        'comparison': 'Comparison',
        'research': 'Research'
    };
    
    let currentFilter = 'all';
    
    function initTagsFilter() {
        const container = document.querySelector('.articles-grid');
        if (!container) return;
        
        const allTags = getAllTags();
        if (allTags.length === 0) return;
        
        // Create tags row
        const tagsRow = document.createElement('div');
        tagsRow.className = 'tags-row';
        tagsRow.style.marginBottom = '2rem';
        tagsRow.style.display = 'flex';
        tagsRow.style.flexWrap = 'wrap';
        tagsRow.style.gap = '0.5rem';
        tagsRow.style.justifyContent = 'center';
        
        // All button
        const allBtn = createTagButton('all', 'All', true);
        tagsRow.appendChild(allBtn);
        
        // Tag buttons
        allTags.forEach(tag => {
            const label = tagLabels[tag] || tag.replace('-', ' ');
            const btn = createTagButton(tag, label);
            tagsRow.appendChild(btn);
        });
        
        // Insert before articles grid
        container.parentNode.insertBefore(tagsRow, container);
        
        // Apply filter on button click
        tagsRow.addEventListener('click', function(e) {
            if (!e.target.matches('.tag-btn')) return;
            const tag = e.target.dataset.tag;
            setActiveFilter(tag);
        });
    }
    
    function createTagButton(tag, label, active = false) {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.dataset.tag = tag;
        btn.textContent = label;
        btn.style.fontFamily = 'var(--font-pixel)';
        btn.style.fontSize = '0.8rem';
        btn.style.padding = '0.4rem 0.8rem';
        btn.style.border = '2px solid var(--border)';
        btn.style.background = 'var(--bg-panel)';
        btn.style.color = 'var(--text-secondary)';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s';
        btn.style.borderRadius = '0';
        if (active) {
            btn.style.borderColor = 'var(--neon-cyan)';
            btn.style.color = 'var(--neon-cyan)';
            btn.style.boxShadow = '0 0 10px var(--neon-cyan)';
        }
        btn.addEventListener('mouseenter', function() {
            if (this.dataset.tag !== currentFilter) {
                this.style.borderColor = 'var(--neon-magenta)';
                this.style.color = 'var(--neon-magenta)';
            }
        });
        btn.addEventListener('mouseleave', function() {
            if (this.dataset.tag !== currentFilter) {
                this.style.borderColor = 'var(--border)';
                this.style.color = 'var(--text-secondary)';
            }
        });
        return btn;
    }
    
    function setActiveFilter(tag) {
        currentFilter = tag;
        // Update button visuals
        document.querySelectorAll('.tag-btn').forEach(btn => {
            const isActive = btn.dataset.tag === tag;
            btn.style.borderColor = isActive ? 'var(--neon-cyan)' : 'var(--border)';
            btn.style.color = isActive ? 'var(--neon-cyan)' : 'var(--text-secondary)';
            btn.style.boxShadow = isActive ? '0 0 10px var(--neon-cyan)' : 'none';
        });
        
        // Filter articles
        document.querySelectorAll('.article-card').forEach(card => {
            const tags = card.dataset.tags?.split(' ') || [];
            const shouldShow = tag === 'all' || tags.includes(tag);
            card.style.display = shouldShow ? '' : 'none';
        });
    }
    
    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTagsFilter);
    } else {
        initTagsFilter();
    }
})();