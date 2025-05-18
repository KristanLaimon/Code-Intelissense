import { MarkdownView, Notice, Plugin } from 'obsidian';
import { Intelisense_ShowFromGlobal as ShowIntelissensePopupOnActualCursor } from 'src/IntelissensePopupConfig';

export interface CodeIntelissenseSettings {
	mySetting: string;
	PopupX_Offset_REM: number;
	PopupY_Offset_REM: number;
	Position: "up" | "down";
}

export class Globals {
	public static INTELISSENSE_POPUP_ELEMENT: HTMLDivElement | null = null;
	public static POPUPID = "kristainlaimon-intelissense-menu";
	public static Settings: CodeIntelissenseSettings = {
		mySetting: 'default', //default value
		PopupX_Offset_REM: 0.9, //default value
		PopupY_Offset_REM: 0.5, //default value
		Position: "down"
	}

	public static ChangeIntelissensePopupPosition(options: {
		startX: number,
		startY: number,
		offsetX_REM: number,
		offsetY_REM: number,
		position: "up" | "down"
	}) {
		if (this.INTELISSENSE_POPUP_ELEMENT) {
			const popup = this.INTELISSENSE_POPUP_ELEMENT;

			// Calculate height in REM
			const heightPx = popup.getBoundingClientRect().height;
			const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
			const heightREM = heightPx / remSize;

			// Determine adjusted Y offset
			const adjustedOffsetY_REM =
				options.position === "up"
					? options.offsetY_REM - heightREM - 1.4
					: options.offsetY_REM;

			popup.style.left = `calc(${options.startX}px + ${options.offsetX_REM}rem)`;
			popup.style.top = `calc(${options.startY}px + ${adjustedOffsetY_REM}rem)`;
		}
	}
}

export default class CodeIntelissensePlugin extends Plugin {
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
		ShowIntelissensePopupOnActualCursor({ options: ["Opción 1", "Opción 2", "Opción 3"] });
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
