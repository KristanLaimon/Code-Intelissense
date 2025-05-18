export const POPUPID = "kristainlaimon-intelissense-menu";

/**
 * Checks if an intellisense popup already exists in the document.
 * @returns {boolean} Whether a popup already exists.
 */
export function IsIntelissensePopupOnScreen(): boolean {
  // Check if menu already exists
  const oldMenu = document.getElementById(POPUPID);
  return !!oldMenu;
}

/**
 * Deletes the intellisense popup if it exists in the document.
 * @returns {boolean} Whether the popup was deleted. If the popup does not exist, returns false.
 */
export function DeleteIntelissensePopup(): boolean {
  const oldMenu = document.getElementById(POPUPID);
  if (oldMenu) {
    oldMenu.remove();
    return true;
  } else {
    return false;
  }
}



/**
 * Creates an IntelliSense popup menu and returns the HTMLDivElement.
 * The popup is styled with a dark theme and contains placeholder options.
 * The menu is removed automatically upon the next key press or mouse click.
 * 
 * @returns {HTMLDivElement} The created IntelliSense popup menu element.
 */
export function CreateIntelissensePopup(coordX: number, coordY: number): HTMLDivElement {
  const menu = document.createElement("div");
  menu.id = POPUPID;
  menu.textContent = "Fake Intellisense Menu: Option1, Option2, Option3";
  menu.style.position = "fixed";

  // Position the menu at the provided coordinates
  menu.style.top = `${coordY}px`;
  menu.style.left = `${coordX}px`;

  menu.style.background = "#222";
  menu.style.color = "#fff";
  menu.style.padding = "8px 16px";
  menu.style.borderRadius = "6px";
  menu.style.zIndex = "9999";
  menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

  // Remove menu on next key or click
  setTimeout(() => {
    window.addEventListener("keydown", () => menu.remove(), { once: true });
    window.addEventListener("mousedown", () => menu.remove(), { once: true });
  }, 0);

  return menu;
}