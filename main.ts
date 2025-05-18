import { MarkdownView, Notice, Plugin } from 'obsidian';
import { ShowIntelissensePopup } from 'src/IntelissensePopupConfig';

export interface CodeIntelissenseSettings {
	mySetting: string;
	PopupX_Offset: number;
	PopupY_Offset: number;
}

export class Globals {
	public static INTELISSENSE_POPUP_ELEMENT: HTMLDivElement | null = null;
	public static POPUPID = "kristainlaimon-intelissense-menu";
	public static Settings: CodeIntelissenseSettings = {
		mySetting: 'default', //default value
		PopupX_Offset: 4, //default value
		PopupY_Offset: 5, //default value
	}
}

export default class CodeIntelissensePlugin extends Plugin {
	// private lastActiveFile: string | null = null;
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
		// this.TriggerIntelissensePopup();
		ShowIntelissensePopup();
	}



	onunload() {
		// Limpia el último listener si existe
		if (this.lastEditorEl) {
			this.lastEditorEl.replaceWith(this.lastEditorEl.cloneNode(true));
			this.lastEditorEl = null;
		}
	}

	async loadSettings() {
		Globals.Settings = Object.assign({}, Globals.Settings, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(Globals.Settings);
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
