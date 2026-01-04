/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />

function init() {
    $ui.register((ctx) => {
        
        // Create MAL button
        const malButton = ctx.action.newAnimePageButton({ label: "MAL" });
        malButton.mount();
        
        // Handle button clicks
        malButton.onClick(async (event) => {
            const media = event.media;
            
            console.log("[MAL Button] Clicked on:", media.title.userPreferred);
            console.log("[MAL Button] External links:", media.externalLinks);
            
            // Try to find MAL ID from external links
            let malId: string | null = null;
            
            if (media.externalLinks && media.externalLinks.length > 0) {
                for (const link of media.externalLinks) {
                    console.log("[MAL Button] Checking link:", link.site, "=>", link.id);
                    if (link.site?.toLowerCase() === 'myanimelist') {
                        malId = link.id;
                        break;
                    }
                }
            }
            
            if (malId) {
                const malUrl = `https://myanimelist.net/anime/${malId}`;
                console.log("[MAL Button] Opening URL:", malUrl);
                
                // Create temporary invisible anchor and click it
                const anchor = document.createElement('a');
                anchor.href = malUrl;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                
                // Append to body, click, and remove
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                
                ctx.toast.success(`Opening MAL: ${media.title.userPreferred}`);
            } else {
                console.log("[MAL Button] No MAL ID found");
                ctx.toast.alert(`No MAL link found for ${media.title.userPreferred}`);
            }
        });
    });
}
