import { Globals } from 'main';
/**
 * Checks if an intellisense popup already exists in the document.
 * @returns {boolean} Whether a popup already exists.
 */
export function Intelissense_CheckIfOnScreen(): boolean {
  // Check if menu already exists
  const oldMenu = document.getElementById(Globals.POPUPID);
  return !!oldMenu;
}
/**
 * Deletes the intellisense popup if it exists in the document.
 * @returns {boolean} Whether the popup was deleted. If the popup does not exist, returns false.
 */
export function Intelissense_DeleteFromScreen(): boolean {
  const oldMenu = document.getElementById(Globals.POPUPID);
  if (oldMenu) {
    oldMenu.remove();
    return true;
  } else {
    return false;
  }
}
export interface ShowingIntelissenseProps {
  options: string[]
}
/**
 * Creates an IntelliSense popup menu and returns the HTMLDivElement.
 * The popup is styled with a dark theme and contains placeholder options.
 * The menu is removed automatically upon the next key press or mouse click.
 * 
 * @returns {HTMLDivElement} The created IntelliSense popup menu element.
 */
export function Intelissense_CreatePopup(options: ShowingIntelissenseProps): HTMLDivElement {
  const menu = document.createElement("div");
  menu.id = Globals.POPUPID;
  menu.style.position = "fixed";

  // Setup menu styling
  Object.assign(menu.style, {
    background: "#222",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "6px",
    zIndex: "9999",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
    maxHeight: "200px",
    overflowY: "auto",
    whiteSpace: "nowrap",
    pointerEvents: "auto",
    userSelect: "none",
    cursor: "default",
    transition: "opacity 0.2s ease-in-out",
    visibility: "hidden"  // Hide it initially
  });

  // Add the options
  options.options.forEach((optionTxt: string) => {
    const selectionDiv = document.createElement("div");
    selectionDiv.textContent = optionTxt;
    selectionDiv.style.padding = "4px 0px";
    selectionDiv.style.textAlign = "left";
    menu.appendChild(selectionDiv);
  });

  menu.style.top = `${Globals.Settings.PopupY_Offset_REM}rem`;
  menu.style.left = `${Globals.Settings.PopupX_Offset_REM}rem`;
  menu.style.visibility = "visible"; // Now show it

  return menu;
}


//Shows initialis from DOWN LEFT corner of CHAR!
export function Intelisense_ShowFromGlobal(options: ShowingIntelissenseProps) {
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
        Globals.INTELISSENSE_POPUP_ELEMENT = Intelissense_CreatePopup(options);
        Globals.ChangeIntelissensePopupPosition({
          startX: rect.left,
          startY: rect.bottom,
          offsetX_REM: Globals.Settings.PopupX_Offset_REM,
          offsetY_REM: Globals.Settings.PopupY_Offset_REM,
          position: Globals.Settings.Position
        })
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
        Globals.ChangeIntelissensePopupPosition({
          startX: rect.left,
          startY: rect.bottom,
          offsetX_REM: Globals.Settings.PopupX_Offset_REM,
          offsetY_REM: Globals.Settings.PopupY_Offset_REM,
          position: Globals.Settings.Position
        })
      }
    }
  }
}
