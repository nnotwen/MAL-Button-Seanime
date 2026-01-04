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
            
            // Try to find MAL ID from external links
            const malLink = media.externalLinks?.find((link: any) => 
                link.site?.toLowerCase() === 'myanimelist'
            );
            
            if (malLink?.id) {
                const malId = malLink.id;
                const malUrl = `https://myanimelist.net/anime/${malId}`;
                
                // Open MAL page
                await ctx.system.openURL(malUrl);
                ctx.toast.success(`Opening MAL: ${media.title.userPreferred}`);
            } else {
                ctx.toast.alert(`Could not find MAL entry for ${media.title.userPreferred}`);
            }
        });
    });
}
