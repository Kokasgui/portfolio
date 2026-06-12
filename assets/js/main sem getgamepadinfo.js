let deltaTime = 0;

let writingMode = true;

const header = document.querySelector("header");
const main = document.querySelector("main");
const footer = document.querySelector("footer");

const navButton = document.querySelector("#nav-icon button");

const actionbar = document.querySelector("#actionbar");

const buttonWiggleAnimation = [
    {
        transform: "scale(1)",
    },
    {
        transform: "scale(1.2, 0.8)",
    },
    {
        transform: "scale(1.4, 0.7)",
    },
    {
        transform: "scale(1.2, 0.8)",
    },
    {
        transform: "scale(1)",
    },
];

let lastFocusedElement = document.body;

// =========================================== OPÇÕES DE ACESSIBILIDADE =====================================================
const accessOptions = {
    // Estas são as opções de acessibilidade que quero implementar
    general: {
        scrollButtons: true,
        soundEffects: true,
    },
    controller: {
        holdDelay: 600, // 450, 600, 750, 900 ms
        holdInterval: 150, // 150, 250, 350, 450 ms
    },
};

console.groupCollapsed("Valores das opções de acessibilidade");
// Isto trata de buscar os valores que estejam guardados no localStorage, para mostrar imediatamente no menu de opções
for (const [group, object] of Object.entries(accessOptions)) {
    // console.log(group, object);
    // console.log(Object.keys(object).length);

    for (const [key, value] of Object.entries(object)) {
        // console.log(key);

        const savedValue = JSON.parse(localStorage.getItem(`${group}.${key}`));
        // console.log(savedValue);

        const input = document.querySelector(`#options input[name='${group}.${key}'`);

        if (savedValue !== null) {
            console.info(`A chave ${group}.${key} vai usar o valor guardado (${savedValue})`);
            accessOptions[group][key] = savedValue;

            if (input.type === "range") {
                input.value = savedValue;
                input.parentElement.querySelector("output").value = `${(savedValue / 1000).toFixed(2)} s`;
            }
            if (input.type === "checkbox") {
                input.checked = savedValue;
            }
        } else {
            console.info(`A chave ${group}.${key} não tem valor guardado, a usar valor padrão`);

            if (input.type === "range") {
                input.value = accessOptions[group][key];
                input.parentElement.querySelector("output").value = `${(accessOptions[group][key] / 1000).toFixed(2)} s`;
            }
            if (input.type === "checkbox") {
                input.checked = accessOptions[group][key];
            }
        }
    }
}
console.groupEnd();

document.querySelectorAll("#options input").forEach((input) => {
    input.addEventListener("change", () => {
        // console.log("yo");

        const [group, key] = input.name.split(".");

        // console.log(accessOptions[group][key]);

        if (input.type === "range") {
            if (input.valueAsNumber !== accessOptions[group][key]) {
                accessOptions[group][key] = input.valueAsNumber;
                // input.ariaValueNow = input.value;
                input.parentElement.querySelector("output").value = `${(accessOptions[group][key] / 1000).toFixed(2)} s`;
            }
        }
        if (input.type === "checkbox") {
            if (input.checked !== accessOptions[group][key]) {
                accessOptions[group][key] = input.checked;
                // input.ariaChecked = input.checked;
                // console.log(input.checked);
            }
        }

        // console.log(`A enviar para o localStorage`);
        localStorage.setItem(input.name, JSON.stringify(accessOptions[group][key]));
    });
});

// window.test = accessOptions;

// Isto trata de adicionar os ícones de cada aplicação
if (location.pathname.includes("/projects/")) {
    const softwareList = Array.from(document.querySelectorAll("#project-abstract ul a, #project-abstract ul span"));

    softwareList.forEach((software) => {
        const icon = software.getAttribute("software");

        const img = document.createElement("img");
        img.src = `../assets/software-icons/${icon}.svg`;
        img.alt = "";
        software.appendChild(img);
    });
}

// Isto vai definir o texto associado a cada botão
const actionbarLabels = {
    select: "Selecionar",
    return: "Voltar",
    openMenu: "Abrir o menu",
    closeMenu: "Fechar o menu",
    // slideHor: "Navegar horizontalmente",
    // slideVer: "Navegar verticalmente",
    // startWrite: "Começar a escrever"
    // stopWrite: "Parar de escrever"
};

let gamepadVendorID = null;
let gamepadProductID = null;

let gamepadConnected = null;

// ========================================= EVENT LISTENERS ===============================================
document.querySelector("#background").addEventListener("click", (e) => {
    if (document.querySelector("#options").ariaHidden === "false") ToggleAccessOptions("mouse");
    else ToggleNavMenu("mouse");
});

navButton.addEventListener("click", () => {
    ToggleNavMenu("mouse");
});
document.querySelectorAll("#accessibility-button, #options-icon button").forEach((element) => {
    element.addEventListener("click", () => {
        ToggleAccessOptions("mouse");
    });
});
document.querySelector("#scroll-up button").addEventListener("click", () => {
    Scroll(-1);
});
document.querySelector("#scroll-down button").addEventListener("click", () => {
    Scroll(1);
});
if (main.querySelector("#project-gallery")) {
    main.querySelector("#gallery-left button").addEventListener("click", () => {
        ChangeGallerySlide(-1);
    });
    main.querySelector("#gallery-right button").addEventListener("click", () => {
        ChangeGallerySlide(1);
    });
}

main.querySelectorAll("#project-gallery figure video").forEach((video) => {
    video.addEventListener("click", () => {
        ToggleGalleryVideo(video);
    });
    video.addEventListener("mousemove", () => {
        ShowPauseButton("show");
    });
});

main.querySelectorAll("form input, form textarea").forEach((formItem) => {
    formItem.addEventListener("click", () => {
        writingMode = true;
        formItem.dispatchEvent(new Event("focus"));
    });
    formItem.addEventListener("focus", () => {
        // console.log(formItem);

        // formItem.removeAttribute("readonly");
        let parent = formItem.parentElement;
        while (parent.tagName !== "FORM") {
            parent = parent.parentElement;
        }

        if (writingMode) {
            if (parent.classList.contains("selecting")) {
                parent.classList.remove("selecting");
                parent.classList.add("writing");
            }
        } else {
            if (parent.classList.contains("writing")) {
                parent.classList.remove("writing");
                parent.classList.add("selecting");
            }
        }
        // writingMode = true;
    });
});

// ================================================== GALERIA DE PROJETOS =================================================
function ToggleGalleryVideo(video) {
    const icon = video.parentElement.querySelector("span > i");
    galleryHoverTime = 0;

    if (video.paused) {
        video.play();

        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
    } else {
        video.pause();

        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
    }
}

let galleryHoverTime = 0;
function ShowPauseButton(command) {
    // console.log(command);

    const iconList = main.querySelectorAll("#project-gallery figure span > i").forEach((icon) => {
        // debugger;
        if (icon.classList.contains("fa-pause")) {
            if (!icon.hasAttribute("hide")) {
                if (galleryHoverTime >= 1000) {
                    icon.setAttribute("hide", "");
                }
            }
        } else if (icon.classList.contains("fa-play")) {
            icon.removeAttribute("hide");
        }

        if (command === "show") {
            galleryHoverTime = 0;
            icon.removeAttribute("hide");
        }
    });
}

let gamepadIndex = null;

// ===================================================== COMANDO DE JOGO =====================================================
window.addEventListener("gamepadconnected", (e) => {
    console.warn(
        `A gamepad was connected at index ${e.gamepad.index}. ${e.gamepad.id} has ${e.gamepad.buttons.length} buttons and ${e.gamepad.axes.length} axes`,
    );

    let gamepadIndex = navigator.getGamepads().findIndex((g) => g === navigator.getGamepads().filter((g) => g !== null)[0]);
    // console.log(navigator.getGamepads().filter((g) => g !== null)[0]);
    // console.log(navigator.getGamepads().findIndex((g) => g === navigator.getGamepads().filter((g) => g !== null)[0]));
    // console.log(navigator.getGamepads());

    if (e.gamepad.index === gamepadIndex) {
        // Obrigado ao Gamepad API por ser open-source. Foi aqui que descobri como é que os browsers mostram: https://github.com/w3c/gamepad/issues/199

        // Em Firefox
        if (e.gamepad.id[4] === "-" && e.gamepad.id[9] === "-") {
            // Como no Firefox é sempre "VVVV-PPPP-Nome do gamepad", basta buscar as strings no início
            gamepadVendorID = e.gamepad.id.substring(0, 4);
            gamepadProductID = e.gamepad.id.substring(5, 9);

            console.log(`Vendor: ${gamepadVendorID} Product: ${gamepadProductID}`);
        }

        // Em Chromium (Chrome, Edge, Opera, etc.)
        else if (e.gamepad.id.includes("Vendor: ") && e.gamepad.id.includes("Product: ")) {
            // Garantir que por acaso não há nenhum comando que se chame "Vendor: blablabla" ou algo do género
            if (e.gamepad.id.indexOf("(") < e.gamepad.id.indexOf("Vendor: ")) {
                // Como em Chromium é sempre "Nome do gamepad (STANDARD GAMEPAD Vendor: VVVV Product: PPPP)", tem de se calcular a posição das strings"
                const vendorString = "Vendor: ";
                const productString = "Product: ";

                const vendorStringIndex = e.gamepad.id.indexOf(vendorString);
                const productStringIndex = e.gamepad.id.indexOf(productString);

                const vendorIDIndex = vendorStringIndex + vendorString.length;
                const productIDIndex = productStringIndex + productString.length;

                gamepadVendorID = e.gamepad.id.substring(vendorIDIndex, vendorIDIndex + 4);
                gamepadProductID = e.gamepad.id.substring(productIDIndex, productIDIndex + 4);

                console.log(`Vendor: ${gamepadVendorID} Product: ${gamepadProductID}`);
            }
        }

        // Noutros casos
        else {
            // Se o nome do comando ligado indicar "XInput" ou "xinput", é porque o comando funciona com o XInput e é interpretado como um comando Xbox genérico
            if (e.gamepad.id.includes("XInput") || e.gamepad.id.includes("xinput")) {
                console.warn("Comando genérico XInput");
                gamepadConnected = "Xbox";
                UpdateActionBar("Xbox");
            } else {
                console.warn("Não tem VendorID nem ProductID disponíveis");
            }
        }

        // Caso sejam descobertos os IDs de vendedor e de produto, tenta-se descobrir qual é o comando em questão
        if (gamepadVendorID && gamepadProductID) {
            switch (gamepadVendorID) {
                // Microsoft (Xbox)
                case "045e":
                    // Aqui todos os comandos têm os mesmos botões

                    switch (gamepadProductID) {
                        case "0b13":
                            console.warn("Xbox Series X/S Controller");
                            gamepadConnected = "Xbox";
                            UpdateActionBar("Xbox");
                            break;

                        case "028e":
                            console.warn("Xbox One Controller (pelo menos segundo o Gamepad Tester)");
                            gamepadConnected = "Xbox";
                            UpdateActionBar("Xbox");
                            break;
                    }
                    break;

                // Sony (PlayStation)
                case "054c":
                    // Aqui tem de se ver se é um comando da PS3, da PS4 ou da PS5 porque o Start e o Select mudam

                    switch (gamepadProductID) {
                        case "0268":
                            console.warn("PS3 Controller");

                            if (e.gamepad.mapping === "standard") {
                                console.warn("PS3 funciona!!"); // No Firefox aparece standard mas os botões estão trocados :(
                            } else {
                                console.warn("PS3 não funciona :("); // Em Chromium não dá :(
                            }

                            break;

                        case "09cc":
                            console.warn("PS4 Controller");
                            gamepadConnected = "PlayStation4";
                            UpdateActionBar("PlayStation4");
                            break;
                    }

                    break;
                // Nintendo
                case "057e":
                    // Aqui vai fazer diferença se ambos os Joy-Cons estão ligados ou se apenas um

                    switch (gamepadProductID) {
                        case "200e": // A junção dos Joy-Cons parece só funcionar em Chromium :(
                            console.warn("Switch Joy-Cons");
                            gamepadConnected = "NintendoSwitch";
                            UpdateActionBar(gamepadConnected);
                            break;

                        case "2006": // No Firefox os analógicos não funcionam :(
                            console.warn("Switch Left Joy-Con");
                            break;

                        case "2007": // No Firefox os analógicos não funcionam :(
                            console.warn("Switch Right Joy-Con");
                            break;
                    }
                    break;
            }
        }

        // if (window.getComputedStyle(actionbar).display === "none") {
        actionbar.style.display = "flex";
        // }
        // gamepadConnected = "PlayStation4";
        // UpdateActionBar(gamepadConnected);
    }
});

window.addEventListener("gamepaddisconnected", (e) => {
    console.warn(`The gamepad at index ${e.gamepad.index} has been disconnected`);

    let gamepadIndex = navigator.getGamepads().findIndex((g) => g === navigator.getGamepads().filter((g) => g !== null)[0]);

    if (e.gamepad.index === gamepadIndex) {
        gamepadConnected = null;
        UpdateActionBar(null);

        // if (actionbar.getAttribute("style") === "display: flex;") {
        if (actionbar.style.display === "flex") {
            actionbar.removeAttribute("style");
        }
    }
});

function ChangeGallerySlide(direction) {
    if (direction !== -1 && direction !== 1) console.error("Direção não definida!");

    const slidesArray = Array.from(main.querySelectorAll("#project-gallery figure"));
    const currentSlide = main.querySelector("figure[aria-current='true']");
    // console.log(slidesArray, currentSlide);

    const currentSlideIndex = slidesArray.findIndex((s) => s === currentSlide);
    // console.log(currentSlideIndex);

    // Isto trata de animar o botão que tiver sido clicado
    let galleryButton;
    if (direction === -1) galleryButton = main.querySelector("#gallery-left button");
    else if (direction === 1) galleryButton = main.querySelector("#gallery-right button");

    galleryButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });

    if ((currentSlideIndex === 0 && direction === -1) || (currentSlideIndex === slidesArray[slidesArray.length - 1] && direction === 1)) {
        return;
    } else {
        currentSlide.removeAttribute("aria-current");
        slidesArray[currentSlideIndex + direction].setAttribute("aria-current", "true");
    }
}

function UpdateActionBar(gamepadType) {
    if (gamepadType === undefined) console.error("gamepadType não foi definido!");

    const mainActions = actionbar.querySelector("#main-actions");

    const jsURL = import.meta.url;
    // console.log(jsURL);
    const newURL = new URL("../action-icons/", jsURL);
    // console.log(newURL.href);

    // Mostrar teclas do teclado
    Array.from(mainActions.children).forEach((action) => {
        const actionType = action.getAttribute("action");
        const span = action.querySelector("span");

        // Se já existir um ícone da tecla/botão, remove-o primeiro
        if (span.querySelector("img")) {
            const img = span.querySelector("img");
            img.remove();
        }

        // debugger;

        const newImg = document.createElement("img");

        if (!gamepadType) {
            newImg.src = `${newURL.href}/keyboard/${actionType}.png`;
        } else {
            newImg.src = `${newURL.href}/${gamepadType}/${actionType}.png`;
        }

        // Se o ficheiro HTML não estiver dentro de nenhuma pasta, trata de fazer o caminho relativo
        // if (relativeDirectory === 0) {
        //     if (!gamepadType) {
        //         newImg.src = `./assets/action-icons/keyboard/${actionType}.png`;
        //     } else {
        //         newImg.src = `./assets/action-icons/${gamepadType}/${actionType}.png`;
        //     }
        // }
        // // Se estiver dentro de alguma pasta, calcula o número de pastas em que está inserido, e adiciona o número ao caminho relativo
        // else {
        //     if (!gamepadType) {
        //         newImg.src = `${"../".repeat(relativeDirectory)}assets/action-icons/keyboard/${actionType}.png`;
        //     } else {
        //         newImg.src = `${"../".repeat(relativeDirectory)}assets/action-icons/${gamepadType}/${actionType}.png`;
        //     }
        // }
        span.appendChild(newImg);
    });
}
UpdateActionBar(null);

const currentKeys = [];

let holdTime = 0;
// let keyPressed = false;

document.addEventListener("keydown", (e) => {
    if (!currentKeys.includes(e.key)) {
        // keyPressed = true;
        currentKeys.push(e.key);
    }

    // console.log(e.key, e.repeat);

    if (e.repeat === true) {
        // Isto impede que a ação se repita ao pressionar sem largar (o ritmo depende das definições do sistema operativo)
        const arrowKeys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];

        // if (arrowKeys.includes(e.key)) e.preventDefault(); // isto impede o scroll na página usando as teclas das setas

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
        UpdateActionBar(null);

        const focusedElement = document.activeElement;
        const form = main.querySelector("form");

        // debugger;

        if (
            e.altKey === false &&
            e.ctrlKey === false &&
            e.metaKey === false &&
            e.key !== "F1" &&
            e.key !== "F2" &&
            e.key !== "F3" &&
            e.key !== "F4" &&
            e.key !== "F5" &&
            e.key !== "F6" &&
            e.key !== "F7" &&
            e.key !== "F8" &&
            e.key !== "F9" &&
            e.key !== "F10" &&
            e.key !== "F11" &&
            e.key !== "F12"
        ) {
            if (!currentKeys.includes("Tab")) {
                if (e.key === "Escape" || e.key === "Esc") {
                    // Isto abre ou fecha o menu principal
                    e.preventDefault();

                    // console.log(e.repeat);

                    if (document.querySelector("#options").ariaHidden === "true") ToggleNavMenu("keyboard");
                    else ToggleAccessOptions("keyboard");
                }

                if (form) {
                    if (!header.contains(focusedElement) && !document.querySelector("#options").contains(focusedElement)) {
                        if (form.contains(focusedElement) && (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA")) {
                            //
                        } else {
                            writingMode = false;
                        }
                    }
                }

                if (!form || (form && !writingMode) || (form && !form.contains(focusedElement))) {
                    e.preventDefault();
                    // Inicia o foco automaticamente caso o utilizador não queira abrir imediatamente o menu
                    if (focusedElement === document.body) {
                        if (
                            currentKeys.includes("ArrowUp") ||
                            currentKeys.includes("ArrowDown") ||
                            currentKeys.includes("ArrowLeft") ||
                            currentKeys.includes("ArrowRight") ||
                            currentKeys.includes("w") ||
                            currentKeys.includes("W") ||
                            currentKeys.includes("s") ||
                            currentKeys.includes("S") ||
                            currentKeys.includes("a") ||
                            currentKeys.includes("A") ||
                            currentKeys.includes("d") ||
                            currentKeys.includes("D") ||
                            currentKeys.includes(" ") ||
                            currentKeys.includes("Spacebar") ||
                            currentKeys.includes("Enter") ||
                            currentKeys.includes("Return") ||
                            currentKeys.includes("Backspace") ||
                            currentKeys.includes("Delete")
                        ) // Se alguma das teclas de navegação for acionada, mas não estiver
                        {
                            e.preventDefault();

                            if (navButton.ariaExpanded === "false") document.querySelector("section").focus({ focusVisible: true });
                            else if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "true")
                                document.querySelector("#nav-list li > a").focus();
                            else if (document.querySelector("#options").ariaHidden === "false") document.querySelector("#options label").focus();
                            return;
                        }
                    }

                    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
                        e.preventDefault();

                        MoveSelection(1, "column");
                    }
                    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
                        e.preventDefault();

                        MoveSelection(-1, "column");
                    }
                    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                        e.preventDefault();

                        // Repõe o atalho de teclado para avançar no histórico
                        if (e.key === "ArrowRight" && e.altKey === true) {
                            history.forward();
                        }

                        MoveSelection(1, "row");
                    }
                    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                        e.preventDefault();

                        // Repõe o atalho de teclado para recuar no histórico
                        if (e.key === "ArrowLeft" && e.altKey === true) {
                            history.back();
                        }

                        MoveSelection(-1, "row");
                    }

                    if (e.key === " " || e.key === "Spacebar" || e.key === "Enter" || e.key === "Return") {
                        e.preventDefault();

                        ActionsMegaFunction("select", "keyboard");
                    }
                    if (e.key === "Backspace" || e.key === "Delete") {
                        ActionsMegaFunction("return", "keyboard");
                    }
                }
            }
        }

        // Para controlar os tabs e para restaurar os atalhos de teclado
        if (e.key === "Tab") {
            // debugger;
            const mainNav = document.querySelector("#main-nav");
            const navList = Array.from(document.querySelector("#nav-list ul").children);
            const options = document.querySelector("#options");
            const optionsList = Array.from(options.querySelectorAll("label"));

            if (main.querySelector("form").contains(focusedElement)) {
                writingMode = true;
            }

            /*console.log(focusedElement);
            console.log(navButton);

            // Se o foco estiver no menu, e sair utilizando o Tab, fecha automaticamente o menu
            if (
                mainNav.contains(focusedElement) &&
                navButton.ariaExpanded === "true" &&
                (navButton === focusedElement || navList[navList.length - 1].contains(focusedElement))
            ) {
                ToggleNavMenu("keyboard");
            }

            if (
                optionsList[0].parentElement.contains(focusedElement) &&
                navButton.ariaExpanded === "true" &&
                (optionsList[0].contains(focusedElement) ||
                    optionsList[optionsList.length - 1].contains(focusedElement))
            ) {
                ToggleAccessOptions("keyboard");
            }

            else if (mainNav.contains(focusedElement) && navButton === focusedElement) {
                console.log("é para fechar");
                ToggleNavMenu("keyboard");
            }*/

            // Se sair do menu pelo fim da lista
            if (
                navList[navList.length - 1].contains(focusedElement) &&
                navButton.ariaExpanded === "true" &&
                options.ariaHidden === "true" &&
                e.shiftKey === false
            ) {
                // e.preventDefault();
                ToggleNavMenu("keyboard");
            }
            // Se sair do menu pelo início (pelo botão)
            if (navButton.contains(focusedElement) && navButton.ariaExpanded === "true" && options.ariaHidden === "true" && e.shiftKey === true) {
                // e.preventDefault();
                ToggleNavMenu("keyboard");
            }
            // Se sair do menu pelo início da lista
            if (options.querySelector("#options-icon button").contains(focusedElement) && e.shiftKey === true) {
                e.preventDefault();
                ToggleAccessOptions("keyboard");
            }
            // Se sair do menu pelo fim da lista
            if (optionsList[optionsList.length - 1].contains(focusedElement) && e.shiftKey === false) {
                e.preventDefault();
                ToggleAccessOptions("keyboard");
            }
        } else {
            if (form && form.contains(focusedElement)) {
                if (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA") {
                    if (e.key === "." && e.ctrlKey === true) {
                        // Esta combinação fecha o modo de escrita
                        if (writingMode) {
                            e.preventDefault();
                            writingMode = false;
                            focusedElement.dispatchEvent(new Event("focus"));
                        }
                    } else {
                        if (!writingMode) e.preventDefault();
                    }
                }
            }
        }
    }
});

document.querySelectorAll("#options label").forEach((label) => {
    label.parentElement.addEventListener("click", (e) => {
        // e.preventDefault();
        // div.parentElement.blur();
        const input = label.parentElement.querySelector("input");

        // console.log(input);

        if (document.activeElement !== input) {
            label.focus();
            input.click();
        }
    });
});

document.addEventListener("keyup", (e) => {
    // keyPressed = false;
    // holdTime = 0;
    currentKeys.splice(e.key);
});

// ================================== MEGA FUNÇÃO DAS AÇÕES POSSÍVEIS ==========================================
function ActionsMegaFunction(action, device) {
    const focusedElement = document.activeElement;

    // ------------------------------------- SELECT ---------------------------------------
    if (action === "select") {
        // debugger;
        if (
            focusedElement.tagName === "A" ||
            focusedElement.tagName === "BUTTON" ||
            focusedElement.tagName === "INPUT" ||
            focusedElement.tagName === "TEXTAREA" ||
            focusedElement.tagName === "SUMMARY"
        ) {
            // Se estiver o botão de navegação
            if (focusedElement === navButton) {
                ToggleNavMenu(device);
            }
            // Se estiver a focar o botão de acessibilidade
            else if (focusedElement === document.querySelector("#accessibility-button")) {
                ToggleAccessOptions(device);
            }
            // Se estiver a focar o botão de fechar o menu de opções
            else if (focusedElement === document.querySelector("#options-icon button")) {
                ToggleAccessOptions(device);
            }
            // Outras opções
            else {
                const pathname = location.pathname;
                const currentUrl = location.href;
                const currentDomain = currentUrl.substring(0, currentUrl.indexOf(pathname));

                if (focusedElement.tagName === "A" && !focusedElement.href.startsWith(currentDomain)) {
                    if (
                        confirm(
                            "Atenção que, ao sair desta página, não vais ter mais acesso a uma navegação adaptada a teclado e comandos de jogo! Queres continuar?",
                        )
                    ) {
                        focusedElement.click();
                    } else {
                        return;
                    }
                } else {
                    if (main.querySelector("form")) {
                        if (main.querySelector("form").contains(focusedElement)) {
                            if (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA") {
                                writingMode = true;
                                focusedElement.dispatchEvent(new Event("focus"));

                                // if ("virtualKeyboard" in navigator) {
                                //     navigator.virtualKeyboard.show();
                                // }
                                return;
                            }
                        }
                    }
                    focusedElement.click();
                }
            }
        } else if (document.querySelector("#options").contains(focusedElement) && focusedElement.tagName === "LABEL") {
            focusedElement.parentElement.querySelector("input").click();
        } else {
            EnterSelection();
        }
    }
    // -------------------------------------- RETURN --------------------------------------
    if (action === "return") {
        // Se o menu de navegação estiver aberto, fecha o menu e volta para a página
        if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "true") {
            ToggleNavMenu(device);
        }
        // Se o menu de opções estiver aberto, fecha as opções e volta para o menu nav
        else if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "false") {
            ToggleAccessOptions(device);
        }
        // Se o menu nav não estiver aberto, retira o foco atual e averigua o que fazer
        else if (!header.contains(focusedElement)) {
            // Se estivermos a lidar com um campo de um formulário, fecha o modo de edição
            if (main.querySelector("form")) {
                if (main.querySelector("form").contains(focusedElement)) {
                    if (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA") {
                        if (writingMode) {
                            writingMode = false;
                            focusedElement.dispatchEvent(new Event("focus"));

                            // if ("virtualKeyboard" in navigator) {
                            //     navigator.virtualKeyboard.hide();
                            // }
                            return;
                        }
                    }
                }
            }
            ExitSelection();
        }
    }
}

function ToggleNavMenu(input) {
    // debugger;
    // console.log(input);

    // Já não é preciso!
    // if (currentKeys.includes("Enter") || currentKeys.includes("Spacebar") || currentKeys.includes(" ")) input = "keyboard";

    const menuList = document.querySelector("#main-nav ul");
    const background = document.querySelector("#background");

    navButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });

    if (menuList.ariaHidden === "true") {
        // console.log("A tentar mostrar");

        menuList.ariaHidden = "false"; // mostra o menu e informa que está visível
        navButton.ariaExpanded = "true";
        background.classList.replace("menu-closed", "menu-open");

        menuList.querySelectorAll("[tabindex='-1']").forEach((link) => {
            link.setAttribute("tabindex", "0");
        });

        const menuFirstOption = menuList.querySelector("li > a");
        // console.log(menuFirstOption);

        menuFirstOption.focus();
        if (input === "mouse") document.activeElement.blur();
    } else if (menuList.ariaHidden === "false") {
        // console.log("A tentar esconder");

        document.activeElement.blur(); // tira o foco atual
        menuList.ariaHidden = "true"; // esconde o menu e informa que está escondido
        navButton.ariaExpanded = "false";
        background.classList.replace("menu-open", "menu-closed");

        menuList.querySelectorAll("[tabindex='0']").forEach((link) => {
            link.setAttribute("tabindex", "-1");
        });

        // Retorna o foco para o último item do main (ou inicia o foco)
        if (lastFocusedElement === document.body && input !== "mouse") main.querySelector("section").focus();
        else {
            // debugger;
            document.activeElement.blur();

            // console.log(document.activeElement, lastFocusedElement);

            if (!currentKeys.includes("Tab")) {
                // Se o input vier to teclado ou do comando
                if (input !== "mouse") {
                    lastFocusedElement.focus();
                } else {
                    lastFocusedElement === document.body;
                }
            }
        }
    }

    // Tira o foco do ícone de navegação (mas o problema é o hover, não o focus)
    if (document.activeElement === navButton) navButton.blur();
}

function ToggleAccessOptions(input) {
    // debugger;

    // console.log(input);

    // Já não é preciso!
    // if (currentKeys.includes("Enter") || currentKeys.includes("Spacebar") || currentKeys.includes(" ")) input = "keyboard";

    const options = document.querySelector("#options");

    const menuList = document.querySelector("#main-nav ul");
    const background = document.querySelector("#background");

    if (options.ariaHidden === "true") {
        // console.log("A tentar mostrar");

        options.ariaHidden = "false"; // mostra o menu e informa que está visível
        background.classList.replace("menu-open", "options-open");

        options.querySelectorAll("button[tabindex='-1'], label[tabindex='-1']").forEach((element) => {
            element.setAttribute("tabindex", "0");
            // console.log(label);
        });

        const menuFirstOption = options.querySelector("label[tabindex='0']");
        // console.log(menuFirstOption);
        menuFirstOption.focus();

        // Se o input vier to teclado ou do comando
        if (input === "mouse") document.activeElement.blur();
    } else if (options.ariaHidden === "false") {
        // console.log("A tentar esconder");
        const optionsButton = options.querySelector("#options-icon button");
        optionsButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });

        // setTimeout(() => {
        document.activeElement.blur(); // tira o foco atual

        options.ariaHidden = "true"; // esconde o menu e informa que está escondido
        background.classList.replace("options-open", "menu-open");

        options.querySelectorAll("button[tabindex='0'], label[tabindex='0']").forEach((element) => {
            element.setAttribute("tabindex", "-1");
            // console.log(label);
        });

        const accessOptionsButton = document.querySelector("#accessibility-button");
        // console.log(accessOptionsButton);
        accessOptionsButton.focus();

        // Se o input vier to teclado ou do comando
        if (input === "mouse") document.activeElement.blur();
        // }, 50);
    }
}

function EnterSelection() {
    // debugger;

    const childrenArray = Array.from(document.activeElement.children);

    if (document.activeElement !== document.body) {
        // if (document.activeElement.tagName === "SECTION")
        for (let i = 0; i < childrenArray.length; i++) {
            // Vai à procura do primeiro link ou botão que encontre para lhe dar foco
            const interactibleChild = childrenArray[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary");

            if (interactibleChild) {
                interactibleChild.focus({ focusVisible: true });
                break;
            }
        }
    } else return;
}

function ExitSelection() {
    // debugger;

    if (document.activeElement.tagName !== "SECTION" && document.activeElement !== footer) {
        const focusedElement = document.activeElement;

        let parent = focusedElement.parentElement;
        do {
            parent = parent.parentElement;
        } while (parent.tagName !== "SECTION" && parent !== footer);

        parent.focus({ focusVisible: true });

        // alert("falta programar esta parte!");
    } else return;
}

function MoveSelection(direction, columnOrRow) {
    if (direction !== 1 && direction !== -1) console.error("Direção não definida!");
    if (columnOrRow !== "row" && columnOrRow !== "column") console.error("Disposição não definida!");

    const focusedElement = document.activeElement;

    const mainNav = document.querySelector("#main-nav");
    const navList = document.querySelector("#nav-list");
    const options = document.querySelector("#options");

    // Se não estivermos no menu de navegação nem no menu de opções, muda para o modo de seleção normal
    if (main.contains(focusedElement) || footer.contains(focusedElement)) {
        writingMode = false;
    }

    if (main.contains(focusedElement) || footer.contains(focusedElement) || mainNav.contains(focusedElement) || options.contains(focusedElement)) {
        let currentNode = focusedElement;
        // let elementList = Array.from(currentNode.children);
        // let elementIndex;

        // debugger;

        // Isto aqui vai ser o loop de navegação, olha para o parent do elemento em que está e analisa os filhos à procura de <a> ou <button>
        while (currentNode) {
            const parent = currentNode.parentElement;

            if (!parent) break;

            let elementList = Array.from(parent.children);
            let elementIndex = elementList.findIndex((n) => n === currentNode);

            // Aqui tratamos logo de alterar as opções do Menu de Acessibilidade
            if (columnOrRow === "row" && options.contains(currentNode) && currentNode.tagName === "LABEL") {
                // debugger;

                const input = parent.querySelector("input");
                if (input) {
                    if (input.type === "range") {
                        // const name = input.name;

                        if (direction === 1) {
                            input.stepUp();
                            input.dispatchEvent(new Event("change"));
                        } else if (direction === -1) {
                            input.stepDown();
                            input.dispatchEvent(new Event("change"));
                        }

                        // console.log(name);

                        // accessOptions[name] = input.valueAsNumber;
                        // input.parentElement.querySelector("output").value = accessOptions[name];

                        // localStorage.setItem(name, accessOptions[name]);

                        // console.log(accessOptions[name]);
                        return;
                    }
                }
            }

            /*// Exceções da navegação para o rodapé
            if (columnOrRow === "row") {
                // Se o elemento em foco for o botão de voltar para o topo
                if (currentNode === footer.querySelector("#go-to-top > a")) {
                    debugger;

                    if (direction === 1) {
                        return;
                    } else if (direction === -1) {
                        const array = Array.from(footer.querySelector("ul#social-media").children);

                        if (array.length !== 0) {
                            for (let i = array.length - 1; i >= 0; i = i--) {
                                if (array[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                    array[i].focus({ focusVisible: true });
                                    return;
                                } else if (array[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    array[i]
                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                        .focus({ focusVisible: true });
                                    return;
                                }
                            }
                        }
                    }
                }
                // Se o elemento em foco for o link para a página principal
                else if (currentNode === footer.querySelector("a.main-logo") && direction === -1) {
                    debugger;

                    // alert("yo");
                    // direction *= -1;
                    // console.log(direction);
                    // debugger;
                }
            }*/

            let i = elementIndex + direction;

            // Isto é o loop dos irmãos do elemento atual
            while (i >= 0 && i <= elementList.length - 1) {
                // Isto acontece quando o foco vai para o header ou para o footer a partir do main
                if (!main.contains(elementList[i]) && main.contains(currentNode)) {
                    // debugger;

                    if (elementList[i] === footer && columnOrRow === "column") {
                        footer.focus({ focusVisible: true });
                        return;
                    }

                    /* // Quando acaba de navegar pelo site, o foco passa para a secção que engloba o elemento que estava em foco
                    let element = lastFocusedElement;
                    while (element.tagName !== "SECTION") {
                        element = element.parentElement;
                    }
                    // console.log(element);
                    element.focus({ focusVisible: true });
                    return;*/
                }
                // E este é o comportamento dentro do main
                else {
                    if (elementList[i].tagName === "SECTION" && columnOrRow === "column") {
                        elementList[i].focus({ focusVisible: true });
                        return;
                    } else {
                        // debugger;

                        // Por algum motivo, isto impede que o foco passe para o botão de navegação
                        // if (columnOrRow === "column" && mainNav.contains(currentNode) && !mainNav.contains(elementList[i])) {
                        //     return;
                        // }

                        // Se por acaso o foco passar para dentro de um dos botões de foco, ignora-os
                        // if (document.querySelector("#scroll-buttons").contains(elementList[i])) {
                        //     // debugger;
                        //     i += direction;
                        //     continue;
                        // }

                        // Se o foco estiver no menu de opções, impede que saia do mesmo
                        if (columnOrRow === "column" && options.contains(currentNode) && !options.contains(elementList[i])) {
                            return;
                        }

                        if (columnOrRow === "column") {
                            // Se por acaso o foco passar para dentro de um dos botões de foco ou da barra de ações, ignora-os
                            if (currentNode === footer && elementList[i] === document.querySelector("#scroll-n-actions")) {
                                i += direction;
                                continue;
                            }
                            // Se vier do footer e passar para o main
                            if (currentNode === footer && elementList[i] === main) {
                                if (elementList[i].querySelector("section")) {
                                    const mainChildren = Array.from(main.children);
                                    mainChildren[mainChildren.length - 1].focus({ focusVisible: true });
                                    return;
                                }
                            }
                        }

                        // console.log(currentNode, elementList[i]);

                        // debugger;

                        // Caso estejamos a percorrer uma lista de <details>, tem de se saltar corretamente quando estão fechados
                        if (direction === 1 && currentNode.tagName === "SUMMARY" && !currentNode.parentElement.hasAttribute("open")) {
                            i += direction;
                            continue;
                        }

                        // Caso estejamos a lidar com um <details>, t
                        if (direction === -1 && elementList[i].tagName === "DETAILS") {
                            if (elementList[i].hasAttribute("open")) {
                                const interactibleList = Array.from(
                                    elementList[i].querySelectorAll("a, button:not([disabled]), [tabindex='0'], input, textarea, summary"),
                                );
                                if (interactibleList.length !== 0) {
                                    // console.log(interactibleList[interactibleList.length - 1]);
                                    interactibleList[interactibleList.length - 1].focus({ focusVisible: true });
                                    return;
                                }
                            } else {
                                const summary = elementList[i].querySelector("summary");
                                // console.log(summary);
                                if (summary) {
                                    summary.focus({ focusVisible: true });
                                    return;
                                }
                            }
                        }

                        // debugger;
                        if (columnOrRow === "column") {
                            // Se estivermos a lidar com ítens dispostos numa linha, cancela a função e foca o elemento pai
                            if (
                                window.getComputedStyle(parent).display.includes("flex") &&
                                window.getComputedStyle(parent).flexDirection.includes("row")
                            ) {
                                i += direction;
                                continue;
                            }
                            // Se não, executa a função
                            else {
                                // console.log(elementList[i]);

                                if (elementList[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // se o próximo/anterior item for um <a> ou <button> ou outro, foca
                                    elementList[i].focus({ focusVisible: true });
                                    return;
                                } else if (elementList[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // console.log(elementList[i].querySelector("a, button, [tabindex='0'], input, summary"));
                                    // se o próximo/anterior item contiver um <a> ou <button> ou outro, foca no que encontrar primeiro
                                    const array = Array.from(
                                        elementList[i].querySelectorAll("a, button:not([disabled]), [tabindex='0'], input, textarea, summary"),
                                    );
                                    // console.log(array);
                                    if (direction === 1 || (direction === -1 && footer.contains(elementList[i]))) {
                                        const summary = elementList[i].querySelector("summary");
                                        if (summary) {
                                            for (let j = 0; j < elementList.length; j++) {
                                                if (summary.parentElement.hasAttribute("open") && summary.parentElement.contains(elementList[i])) {
                                                    array.splice(i, 1);
                                                }
                                            }
                                        }
                                        array[0].focus({ focusVisible: true });
                                    } else if (direction === -1 && !footer.contains(elementList[i])) {
                                        const summary = elementList[i].querySelector("summary");
                                        if (summary) {
                                            for (let j = 0; j < elementList.length; j++) {
                                                if (summary.parentElement.hasAttribute("open") && summary.parentElement.contains(elementList[i])) {
                                                    array.splice(i, 1);
                                                }
                                            }
                                        }
                                        array[array.length - 1].focus({ focusVisible: true });
                                    }

                                    return;
                                }
                            }
                        } else if (columnOrRow === "row") {
                            // debugger;
                            // Se estivermos a lidar com ítens dispostos numa linha, executa a função
                            if (
                                window.getComputedStyle(parent).display.includes("flex") &&
                                window.getComputedStyle(parent).flexDirection.includes("row")
                            ) {
                                if (elementList[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // se o próximo/anterior item for um <a> ou <button> ou outro, foca
                                    elementList[i].focus({ focusVisible: true });
                                    return;
                                } else if (elementList[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    /*const newElementArray = Array.from(elementList[i].children);
                                    if (newElementArray.length !== 0) {
                                        if (direction === 1) {
                                            for (let i = 0; i < newElementArray.length; i = i++) {
                                                if (newElementArray[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                                    newElementArray[i].focus({ focusVisible: true });
                                                    return;
                                                } else if (
                                                    newElementArray[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                ) {
                                                    newElementArray[i]
                                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                        .focus({ focusVisible: true });
                                                    return;
                                                }
                                            }
                                        } else if (direction === -1) {
                                            for (let i = newElementArray.length - 1; i >= 0; i = i--) {
                                                if (newElementArray[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                                    newElementArray[i].focus({ focusVisible: true });
                                                    return;
                                                } else if (
                                                    newElementArray[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                ) {
                                                    newElementArray[i]
                                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                        .focus({ focusVisible: true });
                                                    return;
                                                }
                                            }
                                        }
                                    }
                                    // se o próximo/anterior item contiver um <a> ou <button>, foca no que encontrar primeiro
                                    elementList[i]
                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                        .focus({ focusVisible: true });
                                    return;*/

                                    // se o próximo/anterior item contiver um <a> ou <button> ou outro, foca no que encontrar primeiro
                                    const array = Array.from(
                                        elementList[i].querySelectorAll("a, button:not([disabled]), [tabindex='0'], input, textarea, summary"),
                                    );
                                    if (direction === 1) {
                                        array[0].focus({ focusVisible: true });
                                    } else if (direction === -1) {
                                        array[array.length - 1].focus({ focusVisible: true });
                                    }

                                    return;
                                }
                            }
                            // Se não, cancela a função e foca o elemento pai
                            else {
                                i += direction;
                                continue;
                            }
                        }
                    }
                }

                // Se não encontrar, procura no próximo/anterior index, até que não haja mais
                i += direction;
            }

            // debugger;

            // console.log("já não tem mais filhos, a subir de nível");

            // Se já não houver mais, procura no nível acima
            if (
                main.contains(currentNode) ||
                footer.contains(currentNode) ||
                navButton.contains(currentNode) ||
                navList.contains(currentNode) ||
                options.contains(currentNode)
            ) {
                currentNode = parent;
            } else return;
        }
    } else {
        // console.log(lastFocusedElement);

        if (navButton.ariaExpanded === "false") {
            // Caso o website ainda não tenha tido foco, passa o foco para a primeira secção do website
            if (lastFocusedElement === document.body) {
                main.querySelector("section").focus({ focusVisible: true });
                return;
            } else lastFocusedElement.focus({ focusVisible: true });
            // por exemplo, ao fechar o menu, perde-se o foco, então isto faz com que o foco volte para o elemento em que se estava
        } else {
            mainNav.querySelector("li > a").focus();

            return;
        }
    }
}

function Scroll(direction) {
    if (direction !== -1 && direction !== 1) console.error("direção não definida!");

    // Faz scroll para cima ou para baixo, consoante a direção
    window.scrollBy(0, (window.innerHeight / 2) * direction);

    let scrollButton;
    if (direction === -1) scrollButton = document.querySelector("#scroll-up");
    else if (direction === 1) scrollButton = document.querySelector("#scroll-down");

    // Faz a animação no botão que acionou o evento
    scrollButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });
}

let previousButtons = []; // no final de cada frame, vai guardar as informações dos botões
let previousAxes = [];

let lastFrame = performance.now();

let holdActionStartTime = 0;

// gamepadConnected = "PlayStation4";

// Tem de ser feito um loop de cada frame para que se possa detetar os botões
function MainLoop() {
    const currentFrame = performance.now();

    // console.log(navigator.getGamepads());

    // Caso sem querer atribua o index 1 e o 0 estiver vazio, por exemplo
    const gamepad = navigator.getGamepads().filter((g) => g !== null)[0];
    // console.log(gamepad);

    const focusedElement = document.activeElement;

    // console.log(writingMode);

    // console.log(currentKeys);

    galleryHoverTime += deltaTime;
    // if (galleryHoverTime >= 1000) {
    ShowPauseButton();
    // }
    // console.log(galleryHoverTime);

    if (gamepad) {
        if (gamepad.mapping === "standard") {
            // Isto trata de scrollar na página
            if (Math.abs(gamepad.axes[3]) >= 0.07) {
                window.scrollBy({ left: 0, top: gamepad.axes[3] * 2 * deltaTime, behavior: "instant" });
                UpdateActionBar(gamepadConnected);
            }

            // Isto apenas faz arrays dos valores de todos os botões e dos eixos
            const currentButtons = gamepad.buttons.map((b) => b.value);
            const currentAxes = gamepad.axes;

            // Apenas basta adicionar quando uma tecla é pressionada
            if (currentKeys.length > 0 || !currentButtons.every((b) => b === 0)) {
                holdTime += deltaTime;
                // holdActionStartTime += deltaTime;
            } else {
                holdTime = 0;
                holdActionStartTime = 0;
            }

            // console.log(holdTime);
            // console.log(holdActionStartTime);

            // No momento em que o comando é detetado, assume que no frame anterior nenhum botão foi pressionado
            if (previousButtons[0] === undefined) {
                previousButtons = currentButtons.map((b) => 0);
                // console.log("previousButtons", previousButtons);
            }

            // --------------------------------------- BOTÕES COMANDO ----------------------------------------------
            // Ações de PRESSIONAR um botão
            const buttonPressActions = {
                0: () => {
                    if (gamepadConnected.includes("Nintendo")) {
                        // B tem a ação de voltar
                        ActionsMegaFunction("return", "gamepad");
                    } else {
                        // Xis e A têm a função de selecionar
                        ActionsMegaFunction("select", "gamepad");
                    }
                },
                1: () => {
                    if (gamepadConnected.includes("Nintendo")) {
                        // A tem a ação de selecionar
                        ActionsMegaFunction("select", "gamepad");
                    } else {
                        // Círculo e B têm a função de voltar
                        ActionsMegaFunction("return", "gamepad");
                    }
                },
                9: () => {
                    // Start
                    if (document.querySelector("#options").ariaHidden === "true") ToggleNavMenu("gamepad");
                    else ToggleAccessOptions("gamepad");
                },
                12: () => {
                    // D-pad up
                    MoveSelection(-1, "column");
                },
                13: () => {
                    // D-pad down
                    MoveSelection(1, "column");
                },
                14: () => {
                    // D-pad left
                    MoveSelection(-1, "row");
                },
                15: () => {
                    // D-pad right
                    MoveSelection(1, "row");
                },
            };

            // Ações de LARGAR um botão
            const buttonReleaseActions = {};

            // const buttonHoldActions = {
            //     12: () => {
            //         // D-pad up
            //         MoveSelection(-1, "column");
            //     },
            //     13: () => {
            //         // D-pad down
            //         MoveSelection(1, "column");
            //     },
            // };

            // Avalia o estado atual e anterior dos botões e realiza as ações respetivas
            for (let b = 0; b < currentButtons.length; b++) {
                // Ação PRESS
                if (currentButtons[b] > 0 && previousButtons[b] === 0) {
                    UpdateActionBar(gamepadConnected);

                    // Inicia o foco automaticamente caso o utilizador não queira abrir imediatamente o menu
                    if (focusedElement === document.body) {
                        if (!currentButtons[9] > 0) {
                            if (navButton.ariaExpanded === "false") {
                                document.querySelector("section").focus({ focusVisible: true });
                            } else if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "true") {
                                document.querySelector("#nav-list a").focus();
                            } else if (document.querySelector("#options").ariaHidden === "false") {
                                document.querySelector("#options label").focus();
                            }
                            continue;
                        }
                    }

                    // if (navButton.ariaExpanded === "false")
                    //     document.querySelector("section").focus({ focusVisible: true });
                    // else if (
                    //     navButton.ariaExpanded === "true" &&
                    //     document.querySelector("#options").ariaHidden === "true"
                    // )
                    //     document.querySelector("#nav-list li > a").focus();
                    // else if (document.querySelector("#options").ariaHidden === "false")
                    //     document.querySelector("#options li > label").focus();
                    // return;

                    if (buttonPressActions[b]) buttonPressActions[b]();
                }
                // Ação RELEASE
                if (currentButtons[b] === 0 && previousButtons[b] > 0) {
                    if (buttonReleaseActions[b]) buttonReleaseActions[b]();
                }
                // Ação HOLD
                if (currentButtons[b] > 0 && previousButtons[b] > 0) {
                    // Se ainda não existir, regista o tempo em que se começou a pressionar o botão
                    if (holdActionStartTime === 0) {
                        holdActionStartTime = performance.now();
                        // console.log(holdActionStartTime);
                    }
                    // Se o botão estiver a ser pressionado por mais de 750 ms, inicia as ações de hold
                    if (holdTime >= accessOptions.controller.holdDelay) {
                        // As ações de hold só iniciam segundo um intervalo estipulado anteriormente (padrão é 250 ms)
                        if (currentFrame - holdActionStartTime >= accessOptions.controller.holdInterval) {
                            if (buttonPressActions[b]) buttonPressActions[b]();
                            holdActionStartTime = 0;
                        }
                    }
                }
            }

            // ---------------------------------------- STICKS ANALÓGICOS ---------------------------------------------
            // Avalia o estado atual do analógico esquerdo (só verticalmente) e move a seleção
            if (currentAxes[1] <= -0.95 && previousAxes[1] > -0.95) {
                UpdateActionBar(gamepadConnected);
                MoveSelection(-1, "column");
            }
            if (currentAxes[1] >= 0.95 && previousAxes[1] < 0.95) {
                UpdateActionBar(gamepadConnected);
                MoveSelection(1, "column");
            }
            if (currentAxes[0] <= -0.95 && previousAxes[0] > -0.95) {
                UpdateActionBar(gamepadConnected);
                MoveSelection(-1, "row");
            }
            if (currentAxes[0] >= 0.95 && previousAxes[0] < 0.95) {
                UpdateActionBar(gamepadConnected);
                MoveSelection(1, "row");
            }

            previousButtons = currentButtons;
            previousAxes = currentAxes;
        }
    } else {
        // Apenas basta adicionar quando uma tecla é pressionada
        if (currentKeys.length > 0) holdTime += deltaTime;
        else {
            holdTime = 0;
            holdActionStartTime = 0;
        }

        // console.log(holdTime);
        // console.log(holdActionStartTime);
    }

    // --------------------------------- ATUALIZAÇÃO DAS OPPÇÕES DE ACESSIBILIDADE ---------------------------------------
    // Isto trata de atualizar os valores das opções
    // const optionsArray = Array.from(document.querySelectorAll("#options input"));

    // optionsArray.forEach((input) => {
    //     const [group, key] = input.name.split(".");

    //     // console.log(accessOptions[group][key]);

    //     if (input.type === "range") {
    //         if (input.valueAsNumber !== accessOptions[group][key]) {
    //             accessOptions[group][key] = input.valueAsNumber;
    //             // input.ariaValueNow = input.value;
    //             input.parentElement.querySelector("output").value = `${(accessOptions[group][key] / 1000).toFixed(2)} s`;
    //         }
    //     }
    //     if (input.type === "checkbox") {
    //         if (input.checked !== accessOptions[group][key]) {
    //             accessOptions[group][key] = input.checked;
    //             // input.ariaChecked = input.checked;
    //             // console.log(input.checked);
    //         }
    //     }

    //     // console.log(`A enviar para o localStorage`);
    //     localStorage.setItem(input.name, JSON.stringify(accessOptions[group][key]));
    // });

    // if (document.querySelector("#main-nav").contains(focusedElement) && navButton.ariaExpanded === "true") {
    //     ToggleNavMenu(undefined);
    // }

    // Se o utilizador der scroll à página quando o menu está aberto, o menu fecha automaticamente
    // window.addEventListener("scroll", (e) => {
    //     // debugger;
    //     if (navButton.ariaExpanded === "true") {
    //         if (gamepad && Math.abs(gamepad.axes[3]) >= 0.15) ToggleNavMenu("gamepad");
    //         // else ToggleNavMenu("mouse");
    //     }
    // });

    // console.log(window.test === accessOptions);

    // ----------------------------------- DESATIVAÇÃO DOS BOTÕES DE SCROLL E GALERIA -------------------------------------

    // Os botões de scroll
    const scrollUp = document.querySelector("#scroll-up button");
    const scrollDown = document.querySelector("#scroll-down button");

    // console.log(window.scrollY, document.body.clientHeight - window.innerHeight);

    // Isto trata de desativar os botões de scroll quando eles não vao fazer efetivamente nada
    if (window.scrollY === 0) {
        scrollUp.disabled = true;
        // scrollUp.ariaDisabled = "true";
    } else {
        scrollUp.disabled = false;
        // scrollUp.ariaDisabled = "false";
    }
    if (Math.abs(window.scrollY - (document.body.clientHeight - window.innerHeight)) <= 1) {
        scrollDown.disabled = true;
        // scrollDown.ariaDisabled = "true";
    } else {
        scrollDown.disabled = false;
        // scrollDown.ariaDisabled = "false";
    }

    // Os botões da galeria de imagens
    const galleryLeft = document.querySelector("#gallery-left button");
    const galleryRight = document.querySelector("#gallery-right button");

    // O necessário para calcular em que slide se está
    const slidesArray = Array.from(main.querySelectorAll("#project-gallery figure"));
    const currentSlide = main.querySelector("figure[aria-current='true']");

    // Isto trata de desativar os botões da galeria quando o slide atual é uma das pontas
    if (main.querySelector("#project-gallery")) {
        if (slidesArray[0] === currentSlide) {
            galleryLeft.disabled = true;
            // scrollUp.ariaDisabled = "true";
        } else {
            galleryLeft.disabled = false;
            // scrollUp.ariaDisabled = "false";
        }
        if (slidesArray[slidesArray.length - 1] === currentSlide) {
            galleryRight.disabled = true;
            // scrollUp.ariaDisabled = "true";
        } else {
            galleryRight.disabled = false;
            // scrollUp.ariaDisabled = "false";
        }
    }

    // console.log(writingMode);

    // Se o foco dentro de um form mudar para fora do item que se está a escrever, fecha o writingMode e torna o campo anterior como readonly
    // if (writingMode) {
    //     if (main.querySelector("form")) {
    //         console.log(main.querySelector("form input:not([readonly]), form textarea:not([readonly])"));
    //         if (!main.querySelector("form input:not([readonly]), form textarea:not([readonly])").contains(focusedElement)) {
    //             // if (main.querySelector("form").contains(lastFocusedElement) && lastFocusedElement.tagName !== "BUTTON") {
    //             main.querySelectorAll("form input, form textarea").forEach((formItem) => {
    //                 formItem.setAttribute("readonly", "");
    //                 writingMode = false;
    //             });
    //         }
    //     }
    // }

    let mouseDown = false;

    // Isto vai tratar de limitar o foco nas <section>
    document.addEventListener("mousedown", (e) => {
        if (lastFocusedElement.tagName === "SECTION") focusedElement.blur();
        mouseDown = true;
    });
    document.addEventListener("mouseup", (e) => {
        mouseDown = false;
    });
    if (focusedElement.tagName === "SECTION" && mouseDown === true) {
        console.warn("bruh");
        focusedElement.blur();
    }

    // Se o elemento em foco não for algo do menu ou o body, regista esse elemento para se poder regressar ao foco
    if (focusedElement !== document.body && (main.contains(focusedElement) || footer.contains(focusedElement))) {
        lastFocusedElement = focusedElement;
    }

    // Caso vá para o topo a partir do botão do rodapé, o foco passa automaticamente para a primeira secção
    if (focusedElement === document.body && lastFocusedElement === document.querySelector("#go-to-top a")) {
        // Se o input vier do teclado ou do comando de jogo, foca com focus visible
        if (
            currentKeys.includes("Enter") ||
            currentKeys.includes(" ") ||
            currentKeys.includes("Spacebar") ||
            (gamepad && gamepad.buttons[0].value > 0)
        ) {
            main.querySelector("section").focus({ focusVisible: true });
        }
        // Se não, foca sem realce visual
        else {
            main.querySelector("section").focus();
        }
    }

    // -------------------------------- CÁLCULO DO DELTA TIME E INÍCIO DA PRÓXIMA FRAME ---------------------------------

    // console.log(focusedElement, lastFocusedElement);

    deltaTime = currentFrame - lastFrame; // tempo atual menos o tempo da frame anterior

    lastFrame = currentFrame;
    // console.log(deltaTime);

    // Reinicia o loop
    requestAnimationFrame(MainLoop);
}
MainLoop();
