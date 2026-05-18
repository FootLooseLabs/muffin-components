class JsonEditor extends Muffin.DOMComponent {
  static domElName = "json-editor";

  static dependencies = [
    "https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-min-noconflict/ace.js",
  ]

  static styleMarkup(rootEl) {
    return `<style type="text/css">
        ${rootEl} .ace_editor, ${rootEl} .ace_editor *{
          font-family: "Monaco", "Menlo", "Ubuntu Mono", "Droid Sans Mono", "Consolas", monospace !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          letter-spacing: 0 !important;
        }

        ${rootEl} [name="addTemplateDataBtn"] {
          display: none;
        }

        ${rootEl}[repeat-schema-enabled="true"] [name="addTemplateDataBtn"] {
          display: block;
        }
    </style>`
  }

  static markupFunc(_data, uid, uiVars, routeVars, _constructor, stores) {
    return `<div class="editor-card bg-white rounded-lg shadow-md w-full xl:w-4/5" repeat-schema-enabled="${uiVars.repeatSchemaKey ? 'true' : 'false'}">
      <div class="">
        <div class="relative">
          <div class="editorWrapper relative h-full min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh]">
            <div class="editor bg-gray-50 border border-gray-300 absolute inset-0"></div>
          </div>
          <button name="addTemplateDataBtn" class="absolute right-2.5 bottom-2.5 px-4 py-2 border border-gray-800 text-gray-800 rounded hover:bg-gray-800 hover:text-white transition-colors"
             on-click="addTemplateData">
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>
    </div>`
  }

  constructor() {
    super();
    this.config       = { spacing: 0 };
    this._editor      = null;
    this._editorEl    = null;

    this.uiVars.lockedFields    = [];
    this.uiVars.repeatSchema    = {};
    this.uiVars.repeatSchemaKey = null;

    if (this.attributes.value) {
      try {
        this.uiVars.defaultValue = JSON.parse(this.attributes.value.value);
      } catch(e) {
        console.error("ERROR: json-editor could not parse default value attribute");
      }
    }

    if (this.attributes.placeholder) {
      try {
        this.uiVars.placeholder = JSON.parse(this.attributes.placeholder.value);
      } catch(e) {
        console.error("ERROR: json-editor could not parse placeholder attribute");
      }
    }
  }

  onConnect() {
    const repeatSchemaEl = this.querySelector("repeat-schema");
    if (repeatSchemaEl) {
      try {
        this.uiVars.repeatSchemaKey = repeatSchemaEl.getAttribute("key");
        this.uiVars.repeatSchema    = JSON.parse(repeatSchemaEl.innerHTML);
      } catch(e) {
        console.error("ERROR: json-editor could not parse <repeat-schema> - ", e);
      }
    }

    this._init_();
  }

  async _init_() {
    try {
      await this._loadAllDependencies();
    } catch(e) {
      throw e;
    }

    setTimeout(() => {
      this._initAce();
    }, 500);
  }

  _initAce() {
    this._editorEl = this._getDomNode().querySelector('.editor');

    this._editor = ace.edit(this._editorEl, {
      mode: 'ace/mode/json',
      selectionStyle: 'text',
      showPrintMargin: false,
      theme: 'ace/theme/chrome'
    });

    this._editor.on('paste', (ev) => {
      this.onPasteEvent.call(this, ev);
    });

    this._editor.session.on('change', (delta) => {
      this.onAfterChangeEvent.call(this, delta);
    });

    if (this.uiVars.placeholder) {
      this._setEditorPlaceholder();
    } else if (this.uiVars.defaultValue) {
      this.setJsonValue(this.uiVars.defaultValue);
    }
  }

  onPasteEvent(ev) {
    try {
      ev.text = JSON.stringify(JSON.parse(ev.text), null, 4);
      this.beautify();
    } catch (err) {
      console.log("Error pasting text in API payload editor");
    }
  }

  onAfterChangeEvent(_delta) {}

  formatText(spacing) {
    spacing = spacing || this.config.spacing;
    try {
      const current = JSON.parse(this._editor.getValue());
      this._editor.setValue(JSON.stringify(current, null, spacing));
    } catch (err) {
      alert('ERROR: invalid JSON input');
    }
  }

  copyAll() {
    this._editor.focus();
    this._editor.selectAll();
    document.execCommand('copy');
  }

  _setEditorPlaceholder() {
    if (!this.uiVars.placeholder) { return; }
    const hasValue = this.getValue().length;
    let node = this._editor.renderer.emptyMessageNode;
    if (hasValue && node) {
      this._editor.renderer.scroller.removeChild(node);
      this._editor.renderer.emptyMessageNode = null;
    } else if (!hasValue && !node) {
      node = document.createElement("div");
      node.textContent  = this.uiVars.placeholder;
      node.className    = "ace_emptyMessage";
      node.style.padding  = "0 9px";
      node.style.position = "absolute";
      node.style.zIndex   = 9;
      node.style.opacity  = 0.5;
      this._editor.renderer.emptyMessageNode = node;
      this._editor.renderer.scroller.appendChild(node);
    }
  }

  getValue() {
    return this._editor.getValue();
  }

  setJsonValue(value) {
    this._editor.setValue(JSON.stringify(value));
    this.beautify();
  }

  clearEditor() {
    if (this.uiVars.defaultValue) {
      this.setJsonValue(this.uiVars.defaultValue);
    } else {
      this._editor.setValue("");
    }
  }

  clearAll() {
    this._editor.selectAll();
    this._editor.remove();
  }

  replaceAll(txt) {
    this.clearAll();
    this._editor.session.insert({ row: 0, column: 0 }, txt);
    this.beautify();
    this._editor.clearSelection();
  }

  scrollToLastLine() {
    this._editor.scrollToLine(this._editor.session.getLength());
  }

  addTemplateData() {
    if (!this.uiVars.repeatSchemaKey) { return; }

    let _data = JSON.parse(this.getValue());
    if (this.uiVars.repeatSchemaKey === "*") {
      _data.push(this.uiVars.repeatSchema);
    } else {
      _data[this.uiVars.repeatSchemaKey].push(this.uiVars.repeatSchema);
    }
    this.setJsonValue(_data);
    this.scrollToLastLine();
  }

  minify()  { this.formatText(); }
  beautify() { this.formatText(4); }

  static compose() { super.compose(); }
}

export default JsonEditor;
