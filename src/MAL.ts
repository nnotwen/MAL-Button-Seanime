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
        const animeNameState = ctx.state<string | null>(null);
        
        // Tray to show the link
        const malTray = ctx.newTray({
            tooltipText: "MAL Link",
            withContent: true,
            width: '550px',
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
                    animeNameState.set(media.title.userPreferred);
                    ctx.toast.success(`📌 Tap the link below`);
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
            const animeName = animeNameState.get();
            
            if (!url) {
                return malTray.stack({
                    items: [malTray.text("Click MAL button to get link")],
                });
            }
            
            return malTray.stack({
                items: [
                    malTray.text(animeName || "MyAnimeList", {
                        style: {
                            fontSize: "1em",
                            fontWeight: "bold",
                            marginBottom: "12px",
                        },
                    }),
                    malTray.text(url, {
                        style: {
                            fontSize: "0.95em",
                            color: "#4a9eff",
                            fontFamily: "monospace",
                            padding: "12px",
                            background: "rgba(74, 158, 255, 0.1)",
                            borderRadius: "6px",
                            wordBreak: "break-all",
                            lineHeight: "1.4",
                            cursor: "text",
                        },
                    }),
                    malTray.text("⬆ Tap to select, copy & paste in browser", {
                        style: {
                            fontSize: "0.85em",
                            color: "#888",
                            marginTop: "8px",
                        },
                    }),
                ],
                gap: 0,
                style: {
                    padding: "16px",
                },
            });
        });
    });
}
