import { MarkdownView, Notice, Plugin, Editor } from 'obsidian';
import { CreateIntelissensePopup, IsIntelissensePopupOnScreen } from 'src/IntelissensePopupConfig';


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
		this.ConfigureKeyDownEvent();
	}

	private onKeyDownInsideEditor(actualEditor: HTMLElement, e: KeyboardEvent) {
		if (e.key) this.debug(`Key pressed: ${e.key}`);

		if (e.key === "f") {
			e.preventDefault();
			if (!IsIntelissensePopupOnScreen()) {
				// Get the selection coordinates
				const selection = window.getSelection();
				const range = selection?.getRangeAt(0);
				const rect = range?.getBoundingClientRect();

				if (rect) {
					const popup = CreateIntelissensePopup(
						/* Coord x: */ rect.left + 4,
						/* Coord y: */ rect.bottom + 5 // 5px offset below cursor
					);
					document.body.appendChild(popup);
				}
			}
		}
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

	private debug(msg: string) {
		new Notice(msg);
	}
	//#region Initial Startup Config
	/**
	 * Registers an event listener for keydown events inside the active editor element.
	 * This listener is attached when the active leaf changes, ensuring that the key press
	 * events are captured for the current editor. It prevents the default action for the key
	 * 'f' and displays an IntelliSense menu when pressed. Additionally, it cleans up any existing
	 * editor element to avoid duplicate listeners.
	 */
	private ConfigureKeyDownEvent() {
		//Configuring on key press inside editor event.
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const editorEl = (view as any)?.editor?.containerEl as HTMLElement | undefined;
				if (editorEl && editorEl !== this.lastEditorEl) {
					if (this.lastEditorEl) {
						this.lastEditorEl.replaceWith(this.lastEditorEl.cloneNode(true));
					}
					this.lastEditorEl = editorEl;
					this.registerDomEvent(editorEl, "keydown", (evt: KeyboardEvent) => {
						if (!this.lastEditorEl) return;
						this.onKeyDownInsideEditor(this.lastEditorEl, evt);
					});
				}
			})
		);
	}
	//#endregion
}
