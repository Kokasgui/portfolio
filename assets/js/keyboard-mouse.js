import { ToggleNavMenu, EnterSelection, ExitSelection, MoveSelection } from "./main.js";
import { linkButton, navButton, toolbar } from "./main.js";

export const currentKeys = [];

document.querySelector("#scroll-up").addEventListener("click", () => {
    Scroll(-1);
});
document.querySelector("#scroll-down").addEventListener("click", () => {
    Scroll(1);
});

navButton.addEventListener("click", () => {
    ToggleNavMenu;
});

document.addEventListener("keydown", (e) => {
    if (!currentKeys.includes(e.key)) {
        // keyPressed = true;
        currentKeys.push(e.key);
    }

    // console.log(e.key, e.repeat);

    if (e.repeat === true) {
        // Isto impede que a ação se repita ao pressionar sem largar (o ritmo depende das definições do sistema operativo)
        const arrowKeys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];

        if (arrowKeys.includes(e.key)) e.preventDefault(); // isto impede o scroll na página usando as teclas das setas

        // if (holdTime >= 750) {
        //     if (Math.round(holdTime / 10) % 20 === 0) {
        KeyActions();
        //     }
        // }

        // return; // isto impede que a ação se repita. tem de se programar um hold personalizado ao detetar true, em vez do return (ATRAVÉS DO DELTATIME!!)
    } else {
        if (!currentKeys.includes(e.key)) holdTime = 0;
        KeyActions();
    }

    function KeyActions() {
        // if (e.key === "\\") {
        //     // Isto alterna entre focus e blur, ao pressionar Alt
        //     e.preventDefault();
        //     if (document.activeElement === linkButton) linkButton.blur();
        //     else linkButton.focus();
        // }

        if (e.key === "Escape" || e.key === "Esc") {
            // Isto abre ou fecha o menu principal
            e.preventDefault();

            // console.log(e.repeat);

            ToggleNavMenu();
        }

        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
            e.preventDefault();

            MoveSelection(1);
        }
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            e.preventDefault();

            MoveSelection(-1);
        }

        if (document.activeElement !== document.body) {
            if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
                e.preventDefault();

                if (document.activeElement.tagName === "A" || document.activeElement.tagName === "BUTTON")
                    document.activeElement.click();
                else EnterSelection();
            }
        }
        if (e.key === "Backspace" || e.key === "Delete") {
            if (document.querySelector("#main-nav").contains(document.activeElement)) ToggleNavMenu("close");
            else if (document.querySelector("main").contains(document.activeElement)) {
                ExitSelection();
            }
        }
    }
});

function Scroll(direction) {
    window.scrollBy(0, (window.innerHeight / 2) * direction);
}

document.querySelectorAll("section").forEach((section) => {
    section.addEventListener("click", (e) => {
        e.preventDefault();
    });
});

document.addEventListener("keyup", (e) => {
    // keyPressed = false;
    // holdTime = 0;
    currentKeys.splice(e.key);
});
