// The playground scene. Plain data: the server routes import it to prerender the preview.
// One scene since 2026-11: the Wall holds every component worth previewing.
export type Scene = 'wall';

export const SCENES: { value: Scene; label: string }[] = [{ value: 'wall', label: 'Wall' }];
