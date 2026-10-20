export const loadLeaflet = async (): Promise<any> => {
    if (typeof window === "undefined") {
        throw new Error("Leaflet can only be loaded on the client");
    }

    const leafletModule = await import("leaflet");
    const L = leafletModule.default || leafletModule;
    return L;
};
