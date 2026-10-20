export const createPinIcon = (L: any, color: string, label: string) => {
    return L.divIcon({
        className: "custom-map-marker",
        html: `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
                <div style="background:#ffffff; border-radius:4px; padding:2px 6px; font-size:10px; font-weight:700; color:#0f172a; box-shadow:0 2px 6px rgba(0,0,0,0.15); margin-top:3px; white-space:nowrap; border: 1px solid #e2e8f0;">
                    ${label}
                </div>
            </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 20],
    });
};

export const createCarIcon = (L: any) => {
    return L.divIcon({
        className: "custom-car-marker",
        html: `
            <div style="background-color:#111827; color:#ffffff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.25); border:2px solid #ffffff;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/>
                    <circle cx="16.5" cy="14.5" r="1.5"/>
                </svg>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};
