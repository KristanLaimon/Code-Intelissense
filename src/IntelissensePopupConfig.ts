import { Globals } from 'main';

/**
 * Checks if an intellisense popup already exists in the document.
 * @returns {boolean} Whether a popup already exists.
 */
export function IsIntelissensePopupOnScreen(): boolean {
  // Check if menu already exists
  const oldMenu = document.getElementById(Globals.POPUPID);
  return !!oldMenu;
}

/**
 * Deletes the intellisense popup if it exists in the document.
 * @returns {boolean} Whether the popup was deleted. If the popup does not exist, returns false.
 */
export function DeleteIntelissensePopup(): boolean {
  const oldMenu = document.getElementById(Globals.POPUPID);
  if (oldMenu) {
    oldMenu.remove();
    return true;
  } else {
    return false;
  }
}

type IntelissensePopupOptions = {
  coordX: number;
  coordY: number;
}

/**
 * Creates an IntelliSense popup menu and returns the HTMLDivElement.
 * The popup is styled with a dark theme and contains placeholder options.
 * The menu is removed automatically upon the next key press or mouse click.
 * 
 * @returns {HTMLDivElement} The created IntelliSense popup menu element.
 */
export function CreateIntelissensePopup(options: IntelissensePopupOptions): HTMLDivElement {
  const menu = document.createElement("div");
  menu.id = Globals.POPUPID;
  menu.textContent = "Fake Intellisense Menu: Option1, Option2, Option3";
  menu.style.position = "fixed";

  // Position the menu at the provided coordinates
  menu.style.top = `${options.coordY}px`;
  menu.style.left = `${options.coordX}px`;

  menu.style.background = "#222";
  menu.style.color = "#fff";
  menu.style.padding = "8px 16px";
  menu.style.borderRadius = "6px";
  menu.style.zIndex = "9999";
  menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

  // Remove menu on next key or click
  // setTimeout(() => {
  //   window.addEventListener("keydown", () => menu.remove(), { once: true });
  //   window.addEventListener("mousedown", () => menu.remove(), { once: true });
  // }, 0);

  return menu;
}

export function ShowIntelissensePopup() {
  const selection = window.getSelection();
  const range = selection?.getRangeAt(0);

  if (range) {
    // Create a temporary marker span at the cursor
    const tempSpan = document.createElement("span");
    tempSpan.textContent = "\u200b"; // zero-width space
    tempSpan.style.display = "inline-block";
    tempSpan.style.width = "1px";
    tempSpan.style.height = "1em";
    range.insertNode(tempSpan);

    const rect = tempSpan.getBoundingClientRect();
    tempSpan.remove();

    // Restore selection to avoid cursor jump
    selection?.removeAllRanges();
    selection?.addRange(range);

    if (rect.left !== 0 || rect.bottom !== 0) {
      if (!Globals.INTELISSENSE_POPUP_ELEMENT) {
        // this.intellisensePopup = CreateIntelissensePopup(rect.left + this.settings.PopupX_Offset, rect.bottom + this.settings.PopupY_Offset);
        Globals.INTELISSENSE_POPUP_ELEMENT = CreateIntelissensePopup({
          coordX: rect.left + Globals.Settings.PopupX_Offset,
          coordY: rect.bottom + Globals.Settings.PopupY_Offset,
        });
        document.body.appendChild(Globals.INTELISSENSE_POPUP_ELEMENT);

        // Auto-remove popup on Escape key or click
        const cleanup = () => {
          Globals.INTELISSENSE_POPUP_ELEMENT?.remove();
          Globals.INTELISSENSE_POPUP_ELEMENT = null;
          window.removeEventListener("keydown", onKeyDownOnce);
          window.removeEventListener("mousedown", cleanup);
        };
        const onKeyDownOnce = (evt: KeyboardEvent) => {
          if (evt.key === "Escape") cleanup();
        };
        window.addEventListener("keydown", onKeyDownOnce);
        window.addEventListener("mousedown", cleanup);
      } else {
        // Just move existing popup
        Globals.INTELISSENSE_POPUP_ELEMENT.style.left = `${rect.left + Globals.Settings.PopupX_Offset}px`;
        Globals.INTELISSENSE_POPUP_ELEMENT.style.top = `${rect.bottom + Globals.Settings.PopupY_Offset}px`;
      }
    }
  }
}