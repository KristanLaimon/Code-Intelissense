import { MarkdownView, Notice, Plugin, Editor } from 'obsidian';


interface CodeIntelissenseSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: CodeIntelissenseSettings = {
	mySetting: 'default'
}

export default class CodeIntelissensePlugin extends Plugin {
	settings: CodeIntelissenseSettings;
	lastActiveFile: string | null = null;
	private lastEditorEl: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();
		this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			new Notice('This is a notice!');
		});

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const editorEl = (view as any)?.editor?.containerEl as HTMLElement | undefined;
				if (editorEl && editorEl !== this.lastEditorEl) {
					// Limpia el anterior si existe
					if (this.lastEditorEl) {
						this.lastEditorEl.replaceWith(this.lastEditorEl.cloneNode(true));
					}
					this.lastEditorEl = editorEl;
					this.registerDomEvent(editorEl, "keydown", (evt: KeyboardEvent) => {
						if (evt.key) {
							new Notice(`Letter pressed: ${evt.key}`);
						}
					});
				}
			})
		);
	}

	onunload() {
		// Limpia el último listener si existe
		if (this.lastEditorEl) {
			this.lastEditorEl.replaceWith(this.lastEditorEl.cloneNode(true));
			this.lastEditorEl = null;
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
