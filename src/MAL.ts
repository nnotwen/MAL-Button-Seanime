/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />

/**
 * MAL Button Plugin for Seanime
 * Adds a MyAnimeList link button (blue pill) to anime details page
 * 
 * v3.3.0:
 * - Added polling to wait for container (fixes "slow to show")
 * - Enhanced deduplication logic
 * 
 * @version 3.3.0
 * @author bruuhim
 */

function init() {
    $ui.register((ctx: any) => {
        console.log("[MAL Button] v3.3.0 Initializing...");

        // --- Constants ---
        const BUTTON_ATTR = "data-mal-button";
        let lastInjectedId: number | null = null;

        /**
         * Get MAL ID from media object
         */
        const mediaToMalId = (media: any): string | null => {
            return media?.idMal ? String(media.idMal) : null;
        };

        /**
         * Wait for the container element to appear
         */
        const waitForContainer = async (retries = 10, interval = 500): Promise<any> => {
            for (let i = 0; i < retries; i++) {
                const container = await ctx.dom.queryOne("[data-media-page-header-entry-details-date-container]");
                if (container) return container;
                await new Promise(resolve => setTimeout(resolve, interval));
            }
            return null;
        };

        /**
         * Inject the MAL button (blue pill) into the header
         */
        const injectButton = async (animeId: number) => {
            try {
                // Wait for container - wait up to 5 seconds
                const container = await waitForContainer();

                if (!container) {
                    console.log("[MAL Button] Container not found after waiting.");
                    return;
                }

                // Remove ALL existing MAL buttons first (in case of duplicates)
                // We assume query returns an array if there are multiple matches? 
                // ctx.dom API usually has query and queryOne. Let's stick to cleaning up what we find.
                // We'll loop until no more buttons are found to be safe.
                while (true) {
                    const existing = await container.queryOne(`[${BUTTON_ATTR}]`);
                    if (existing) {
                        await existing.remove();
                        console.log("[MAL Button] Removed existing button.");
                    } else {
                        break;
                    }
                }

                // Fetch anime data
                const animeEntry = await ctx.anime.getAnimeEntry(animeId);
                const malId = mediaToMalId(animeEntry?.media);

                if (!malId) {
                    console.log("[MAL Button] No MAL ID found for anime:", animeId);
                    return;
                }

                // Create the anchor element (blue pill)
                const anchor = await ctx.dom.createElement("a");
                anchor.setAttribute(BUTTON_ATTR, malId);
                anchor.setAttribute("href", `https://myanimelist.net/anime/${malId}`);
                anchor.setAttribute("target", "_blank");
                anchor.setAttribute("rel", "noopener noreferrer");
                anchor.setInnerHTML("MAL");

                // Apply styles
                anchor.setStyle("background-color", "#2e51a2");
                anchor.setStyle("padding", "0 10px");
                anchor.setStyle("border-radius", "9999px");
                anchor.setStyle("color", "#fff");
                anchor.setStyle("font-weight", "600");
                anchor.setStyle("font-size", "0.875rem");
                anchor.setStyle("text-decoration", "none");
                anchor.setStyle("display", "inline-flex");
                anchor.setStyle("align-items", "center");
                anchor.setStyle("cursor", "pointer");
                anchor.setStyle("margin-left", "0.5rem"); // Add some spacing

                // Final check before appending
                const doubleCheck = await container.queryOne(`[${BUTTON_ATTR}]`);
                if (!doubleCheck) {
                    container.append(anchor);
                    lastInjectedId = animeId;
                    console.log("[MAL Button] Blue pill injected for MAL ID:", malId);
                }

            } catch (err) {
                console.error("[MAL Button] Injection error:", err);
            }
        };

        // --- Navigation Handler ---
        if (ctx.screen && ctx.screen.onNavigate) {
            ctx.screen.onNavigate(async (nav: any) => {
                if (nav?.pathname !== "/entry" || !nav?.searchParams?.id) return;

                const mediaId = parseInt(nav.searchParams.id);
                if (isNaN(mediaId)) return;

                console.log("[MAL Button] Navigation to anime page, ID:", mediaId);
                // Reset lastInjectedId to ensure we force a check even if revisiting same page
                lastInjectedId = null;
                await injectButton(mediaId);
            });
        }

        // --- DOM Observer ---
        if (ctx.dom && ctx.dom.observe) {
            ctx.dom.observe("[data-media-page-header-entry-details-date-container]", async () => {
                if (lastInjectedId) {
                    // Just a quick check to see if our button is gone
                    const container = await ctx.dom.queryOne("[data-media-page-header-entry-details-date-container]");
                    if (container) {
                        const existing = await container.queryOne(`[${BUTTON_ATTR}]`);
                        if (!existing) {
                            console.log("[MAL Button] Button missing, re-injecting...");
                            await injectButton(lastInjectedId);
                        }
                    }
                }
            });
        }
    });
}

init();
