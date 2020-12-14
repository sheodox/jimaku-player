import page from "page";

export function getRouteToItem(item) {
    return `/v/${encodeURIComponent(item.src)}`
}

export function selectPath(item) {
    page(getRouteToItem(item));
}
