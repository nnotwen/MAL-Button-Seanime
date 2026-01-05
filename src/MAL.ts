/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />

function init() {
    $ui.register((ctx) => {
        
        // Create MAL button
        const malButton = ctx.action.newAnimePageButton({ 
            label: "MAL",
        });
        malButton.mount();
        
        // State for MAL URL
        const malUrlState = ctx.state<string | null>(null);
        
        // Tray to show the link
        const malTray = ctx.newTray({
            tooltipText: "MAL Link",
            withContent: true,
            width: '500px',
            iconUrl: "https://raw.githubusercontent.com/bruuhim/MAL-Button-Seanime/refs/heads/main/src/icon.png",
        });
        
        // Handle button click
        malButton.onClick(async (event: any) => {
            const media = event.media;
            
            try {
                let malId: string | null = null;
                
                if (media.idMal) {
                    malId = String(media.idMal);
                } else {
                    const animeEntry = await ctx.anime.getAnimeEntry(media.id);
                    
                    if (animeEntry?.media) {
                        const fullMedia = animeEntry.media;
                        if (fullMedia.idMal) {
                            malId = String(fullMedia.idMal);
                        } else if (fullMedia.externalLinks) {
                            for (const link of fullMedia.externalLinks) {
                                if (link.site?.toLowerCase() === 'myanimelist') {
                                    malId = link.id;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                if (malId) {
                    const url = `https://myanimelist.net/anime/${malId}`;
                    malUrlState.set(url);
                    ctx.toast.success(`MAL: ${media.title.userPreferred}`);
                    malTray.open();
                } else {
                    ctx.toast.error(`No MAL ID found`);
                }
            } catch (error: any) {
                ctx.toast.error(`Error: ${error?.message || error}`);
            }
        });
        
        // Render tray with link
        malTray.render(() => {
            const url = malUrlState.get();
            
            if (!url) {
                return malTray.stack({
                    items: [malTray.text("Click MAL button")],
                });
            }
            
            return malTray.stack({
                items: [
                    malTray.text("MyAnimeList Link", {
                        style: {
                            fontSize: "1em",
                            fontWeight: "bold",
                        },
                    }),
                    malTray.button(url, {
                        intent: "primary",
                    }),
                    malTray.text("Right-click to copy link", {
                        style: {
                            fontSize: "0.85em",
                            color: "#888",
                        },
                    }),
                ],
                gap: 10,
                style: {
                    padding: "12px",
                },
            });
        });
    });
}
