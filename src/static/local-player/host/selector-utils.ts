import page from 'page';
import type { DirectoryMetadata, VideoMetadata } from '../../../shared/types/videos';

type SelectableItem = DirectoryMetadata | VideoMetadata;

export function getRouteToItem(item: SelectableItem) {
	return `/v/${encodeURIComponent(item.path)}`;
}

export function selectPath(item: SelectableItem) {
	page(getRouteToItem(item));
}
