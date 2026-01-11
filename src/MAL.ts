/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />

/**
 * MAL Button Plugin for Seanime
 * Adds a MyAnimeList link button (blue pill) to anime details page
 * 
 * Uses DOM injection with anchor tag as recommended by the dev
 * 
 * @version 3.2.0
 * @author bruuhim
 */

function init() {
    $ui.register((ctx: any) => {
        console.log("[MAL Button] v3.2.0 Initializing...");

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
         * Inject the MAL button (blue pill) into the header
         */
        const injectButton = async (animeId: number) => {
            try {
                // Skip if already injected for this anime
                if (lastInjectedId === animeId) {
                    console.log("[MAL Button] Already injected for anime:", animeId);
                    return;
                }

                // Find the container
                const container = await ctx.dom.queryOne("[data-media-page-header-entry-details-date-container]");
                if (!container) {
                    console.log("[MAL Button] Container not found, will retry...");
                    return;
                }

                // Remove any existing MAL buttons first
                const existing = await container.queryOne(`[${BUTTON_ATTR}]`);
                if (existing) {
                    existing.remove();
                    console.log("[MAL Button] Removed existing button.");
                }

                // Fetch anime data to get MAL ID
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

                // Apply blue pill styles
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

                // Append to container
                container.append(anchor);
                lastInjectedId = animeId;

                console.log("[MAL Button] Blue pill injected for MAL ID:", malId);
            } catch (err) {
                console.error("[MAL Button] Injection error:", err);
            }
        };

        // --- Navigation Handler ---
        if (ctx.screen && ctx.screen.onNavigate) {
            ctx.screen.onNavigate(async (nav: any) => {
                // Check if on anime entry page
                if (nav?.pathname !== "/entry" || !nav?.searchParams?.id) return;

                const mediaId = parseInt(nav.searchParams.id);
                if (isNaN(mediaId)) return;

                console.log("[MAL Button] Navigation to anime page, ID:", mediaId);
                await injectButton(mediaId);
            });
            console.log("[MAL Button] Navigation handler registered.");
        }

        // --- DOM Observer for Persistence ---
        if (ctx.dom && ctx.dom.observe) {
            ctx.dom.observe("[data-media-page-header-entry-details-date-container]", async () => {
                if (lastInjectedId) {
                    const container = await ctx.dom.queryOne("[data-media-page-header-entry-details-date-container]");
                    if (container) {
                        const existing = await container.queryOne(`[${BUTTON_ATTR}]`);
                        if (!existing) {
                            console.log("[MAL Button] DOM changed, re-injecting...");
                            const tempId = lastInjectedId;
                            lastInjectedId = null; // Reset to allow re-injection
                            await injectButton(tempId);
                        }
                    }
                }
            });
            console.log("[MAL Button] DOM observer registered.");
        }
    });
}

init();
