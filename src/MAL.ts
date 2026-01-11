/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />

/**
 * MAL Button Plugin for Seanime
 * Adds a MyAnimeList link button (blue pill) to anime and manga details pages.
 * 
 * v1.0.0:
 * - Added Manga support! (Checks ctx.manga if anime lookup fails)
 * - Intelligent URL generation (/anime/ vs /manga/)
 * - Stable release with robust duplication and race condition fixes.
 * 
 * @version 1.0.0
 * @author bruuhim
 */

$ui.register((ctx: any) => {
    console.log("[MAL Button] v1.0.0 Initializing...");

    // --- Constants ---
    const BUTTON_ATTR = "data-mal-button";
    let currentMediaId: number | null = null; // Track ONLY the current valid ID

    /**
     * Get MAL ID from media object
     */
    const mediaToMalId = (media: any): string | null => {
        return media?.idMal ? String(media.idMal) : null;
    };

    /**
     * Helper to wait using ctx.setTimeout
     */
    const wait = (ms: number) => new Promise<void>((resolve) => {
        if (ctx.setTimeout) {
            ctx.setTimeout(resolve, ms);
        } else {
            resolve();
        }
    });

    /**
     * Wait for the container element to appear
     */
    const waitForContainer = async (retries = 10, interval = 500): Promise<any> => {
        for (let i = 0; i < retries; i++) {
            const container = await ctx.dom.queryOne("[data-media-page-header-entry-details-date-container]");
            if (container) return container;
            await wait(interval);
        }
        return null;
    };

    /**
     * Remove ALL existing MAL buttons from a container
     */
    const removeExistingButtons = async (container: any) => {
        try {
            for (let i = 0; i < 5; i++) { // Safety limit of 5 removals
                const existing = await container.queryOne(`[${BUTTON_ATTR}]`);
                if (existing) {
                    await existing.remove();
                } else {
                    break;
                }
            }
        } catch (e) {
            console.error("[MAL Button] Error removing buttons:", e);
        }
    };

    /**
     * Inject the MAL button (blue pill) into the header
     */
    const injectButton = async (mediaId: number) => {
        // Validation: If the ID changed while we were waiting, abort
        if (currentMediaId !== mediaId) return;

        try {
            const container = await waitForContainer();
            if (!container) {
                console.log("[MAL Button] Container not found.");
                return;
            }

            // AGGRESSIVE CLEANUP: Remove old buttons first
            await removeExistingButtons(container);

            // Validation check again after waiting
            if (currentMediaId !== mediaId) return;

            // --- DATA FETCHING (Anime OR Manga) ---
            let malId: string | null = null;
            let type: "anime" | "manga" = "anime";

            // 1. Try Anime first
            if (ctx.anime && ctx.anime.getAnimeEntry) {
                const animeEntry = await ctx.anime.getAnimeEntry(mediaId);
                malId = mediaToMalId(animeEntry?.media);
            }

            // 2. If no Anime ID found, try Manga (if API exists)
            if (!malId && ctx.manga && ctx.manga.getMangaEntry) {
                const mangaEntry = await ctx.manga.getMangaEntry(mediaId);
                malId = mediaToMalId(mangaEntry?.media);
                if (malId) type = "manga";
            }

            if (!malId) {
                console.log("[MAL Button] No MAL ID found for media:", mediaId);
                return;
            }

            console.log(`[MAL Button] Found ${type} MAL ID: ${malId}`);

            // Create anchor
            const anchor = await ctx.dom.createElement("a");
            anchor.setAttribute(BUTTON_ATTR, malId);
            anchor.setAttribute("href", `https://myanimelist.net/${type}/${malId}`);
            anchor.setAttribute("target", "_blank");
            anchor.setAttribute("rel", "noopener noreferrer");
            anchor.setInnerHTML("MAL");

            // Blue Pill Styles
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
            anchor.setStyle("margin-left", "0.5rem");

            // Final safety check
            const check = await container.queryOne(`[${BUTTON_ATTR}]`);
            if (!check) {
                container.append(anchor);
                console.log("[MAL Button] Injected successfully.");
            }

        } catch (err) {
            console.error("[MAL Button] Injection error:", err);
        }
    };

    // --- Navigation Handler ---
    if (ctx.screen && ctx.screen.onNavigate) {
        ctx.screen.onNavigate(async (nav: any) => {
            // Check for /entry (anime) or /manga-entry (manga, potentially)
            // But user logs showed /entry being used for Manga too (ID 192507)
            // So we rely on ID checking.
            if (!nav?.pathname?.includes("entry") || !nav?.searchParams?.id) return;

            const mediaId = parseInt(nav.searchParams.id);
            if (isNaN(mediaId)) return;

            console.log("[MAL Button] Navigated to:", mediaId);
            currentMediaId = mediaId; // Update global ID immediately
            await injectButton(mediaId);
        });
    }

    // --- DOM Observer ---
    if (ctx.dom && ctx.dom.observe) {
        ctx.dom.observe("[data-media-page-header-entry-details-date-container]", async () => {
            if (currentMediaId) {
                const container = await ctx.dom.queryOne("[data-media-page-header-entry-details-date-container]");
                if (container) {
                    const existing = await container.queryOne(`[${BUTTON_ATTR}]`);
                    if (!existing) {
                        console.log("[MAL Button] Button missing, re-injecting...");
                        await injectButton(currentMediaId);
                    }
                }
            }
        });
    }
});
