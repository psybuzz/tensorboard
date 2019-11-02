export function create(tag, className) {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}