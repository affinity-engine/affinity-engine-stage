export default function layerName(name) {
  return `ae-stage-layer-${name.replace(/\./g, '-')}`;
}
