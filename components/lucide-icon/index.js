import * as LucideIcons from 'lucide';

class LucideIcon extends Muffin.DOMComponent {
  static domElName = "lucide-icon";

  static renderIcon(iconName, size = 16, className = "") {
    // Convert kebab-case to PascalCase for Lucide icon names
    // e.g., 'share-2' -> 'Share2', 'chevrons-right' -> 'ChevronsRight'
    const pascalCaseName = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const IconComponent = LucideIcons[pascalCaseName];

    if (!IconComponent) {
      console.warn(`Lucide icon "${iconName}" (${pascalCaseName}) not found`);
      return '';
    }

    const elements = IconComponent;

    return `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="${className}"
    >${elements.map(element => {
      const [type, attrs] = element;

      if (type === 'path') {
        return `<path d="${attrs.d}"></path>`;
      } else if (type === 'circle') {
        return `<circle cx="${attrs.cx}" cy="${attrs.cy}" r="${attrs.r}"></circle>`;
      } else if (type === 'polyline') {
        return `<polyline points="${attrs.points}"></polyline>`;
      } else if (type === 'line') {
        return `<line x1="${attrs.x1}" y1="${attrs.y1}" x2="${attrs.x2}" y2="${attrs.y2}"></line>`;
      } else if (type === 'rect') {
        return `<rect x="${attrs.x}" y="${attrs.y}" width="${attrs.width}" height="${attrs.height}"${attrs.rx ? ` rx="${attrs.rx}"` : ''}></rect>`;
      } else if (type === 'ellipse') {
        return `<ellipse cx="${attrs.cx}" cy="${attrs.cy}" rx="${attrs.rx}" ry="${attrs.ry}"></ellipse>`;
      } else if (type === 'polygon') {
        return `<polygon points="${attrs.points}"></polygon>`;
      }
      return '';
    }).join('')}</svg>`;
  }

  static markupFunc(_data, uid, uiVars, routeVars, _constructor) {
    const { icon, size, className } = uiVars;

    if (!icon) {
      console.warn('LucideIcon: no icon attribute provided');
      return _constructor.renderIcon('shield-question-mark', size, 'text-yellow-700');
    }

    return _constructor.renderIcon(icon, size, className);
  }

  constructor() {
    super();
  }

  postRender() {
    this.uiVars.icon = this.getAttribute('icon') || '';
    this.uiVars.size = parseInt(this.getAttribute('size')) || 16;
    this.uiVars.className = this.getAttribute('class') || '';
  }
}

export default LucideIcon;
