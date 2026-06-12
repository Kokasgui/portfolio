let deltaTime = 0;

// Isto serve só para este primeiro teste, depois o focus vai saltar entre cada elemento, pensando em elementos pai e filhos
const linkButton = document.querySelector(".button-link > a");
const navButton = document.querySelector("#nav-icon button");

const toolbar = document.querySelector("#toolbar");

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

const accessOptions = {
    // Estas são as opções de acessibilidade que quero implementar
    general: {
        scrollButtons: true,
    },
    controller: {
        holdDelay: 600, // 450, 600, 750, 900 ms
        holdInterval: 150, // 150, 250, 350, 450 ms
    },
};

let toolbarButtons = {
    // Isto vai definir o texto associado a cada botão
    0: "Selecionar", // Xis / A
    1: "Voltar", // Círculo / B
    3: "Opções", // Triângulo, X
};
let otherButtons = 9; // Start / Menu

let gamepadVendorID = null;
let gamepadProductID = null;

document.querySelector("#background").addEventListener("click", (e) => {
    if (document.querySelector("#options").ariaHidden === "false") ToggleAccessOptions("mouse");
    else ToggleNavMenu("mouse");
});

window.addEventListener("gamepadconnected", (e) => {
    console.warn(
        `A gamepad was connected at index ${e.gamepad.index}. ${e.gamepad.id} has ${e.gamepad.buttons.length} buttons and ${e.gamepad.axes.length} axes`,
    );

    // Obrigado ao Gamepad API por ser open-source. Foi aqui que descobri como é que os browsers mostram: https://github.com/w3c/gamepad/issues/199
    // Em Firefox
    if (e.gamepad.id[4] === "-" && e.gamepad.id[9] === "-") {
        // Como no Firefox é sempre "VVVV-PPPP-Nome do gamepad", basta buscar as strings no início
        gamepadVendorID = e.gamepad.id.substring(0, 4);
        gamepadProductID = e.gamepad.id.substring(5, 9);

        console.log(`Vendor: ${gamepadVendorID} Product: ${gamepadProductID}`);
    }

    // Em Chromium
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
    } else console.warn("Não tem VendorID nem ProductID disponíveis");

    if (gamepadVendorID && gamepadProductID)
        switch (gamepadVendorID) {
            // Microsoft (Xbox)
            case "045e":
                // Aqui todos os comandos têm os mesmos botões

                switch (gamepadProductID) {
                    case "0b13":
                        console.warn("Xbox Series X/S Controller");
                        break;

                    case "028e":
                        console.warn("Xbox One Controller (pelo menos segundo o Gamepad Tester)");
                        break;
                }
                break;

            // Sony (PlayStation)
            case "054c":
                // Aqui tem de se ver se é um comando da PS3, da PS4 ou da PS5 porque o Start e o Select mudam

                switch (gamepadProductID) {
                    case "0268":
                        console.warn("PS3 Controller");

                        if (e.gamepad.mapping === "standard")
                            console.warn("PS3 funciona!!"); // No Firefox aparece standard mas os botões estão trocados :(
                        else console.warn("PS3 não funciona :("); // Em Chromium não dá :(

                        break;

                    case "09cc":
                        console.warn("PS4 Controller");
                        break;
                }

                break;
            // Nintendo
            case "057e":
                // Aqui vai fazer diferença se ambos os Joy-Cons estão ligados ou se apenas um

                switch (gamepadProductID) {
                    case "200e": // A junção dos Joy-Cons parece só funcionar em Chromium :(
                        console.warn("Switch Joy-Cons");
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
});

window.addEventListener("gamepaddisconnected", (e) => {
    console.warn(`The gamepad at index ${e.gamepad.index} has been disconnected`);
});

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
        const focusedElement = document.activeElement;

        // if (e.key === "\\") {
        //     // Isto alterna entre focus e blur, ao pressionar Alt
        //     e.preventDefault();
        //     if (document.activeElement === linkButton) linkButton.blur();
        //     else linkButton.focus();
        // }

        // Inicia o foco automaticamente caso o utilizador não queira abrir imediatamente o menu
        if (focusedElement === document.body && lastFocusedElement === document.body) {
            if (
                currentKeys.includes("W") ||
                currentKeys.includes("w") ||
                currentKeys.includes("A") ||
                currentKeys.includes("a") ||
                currentKeys.includes("S") ||
                currentKeys.includes("s") ||
                currentKeys.includes("D") ||
                currentKeys.includes("d") ||
                currentKeys.includes("ArrowUp") ||
                currentKeys.includes("ArrowLeft") ||
                currentKeys.includes("ArrowDown") ||
                currentKeys.includes("ArrowRight")
            ) {
                e.preventDefault();

                if (navButton.ariaExpanded === "false") document.querySelector("section").focus({ focusVisible: true });
                else if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "true")
                    document.querySelector("#nav-list li > a").focus();
                else if (document.querySelector("#options").ariaHidden === "false")
                    document.querySelector("#options li > label").focus();
                return;
            }
        }

        if (e.key === "Escape" || e.key === "Esc") {
            // Isto abre ou fecha o menu principal
            e.preventDefault();

            // console.log(e.repeat);

            if (document.querySelector("#options").ariaHidden === "true") {
                ToggleNavMenu("keyboard");
            } else ToggleAccessOptions("keyboard");
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

        if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
            e.preventDefault();

            // if (document.activeElement !== document.body) {
            if (
                focusedElement.tagName === "A" ||
                focusedElement.tagName === "BUTTON" ||
                focusedElement.tagName === "INPUT"
            ) {
                focusedElement.click();
            } else if (
                document.querySelector("#options").contains(focusedElement) &&
                focusedElement.tagName === "LABEL"
            ) {
                focusedElement.parentElement.querySelector("input").click();
            } else {
                EnterSelection();
            }
        }
        if (e.key === "Backspace" || e.key === "Delete") {
            // Se estiver o menu nav aberto, fecha o menu
            if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "true")
                ToggleNavMenu("gamepad");
            // Se o menu de opções estiver aberto, fecha as opções e volta para o menu nav
            else if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "false")
                ToggleAccessOptions("keyboard");
            // Se o menu nav não estiver aberto, retira o foco atual e passa para a respetiva secção
            else if (!document.querySelector("keyboard").contains(focusedElement)) ExitSelection();
        }

        if (e.key === "Tab") {
            const navList = Array.from(document.querySelector("#nav-list ul").children);
            const optionsList = Array.from(document.querySelectorAll("#options li"));

            // Se sair do menu pelo fim da lista
            if (navList[navList.length - 1].contains(focusedElement) && e.shiftKey === false) {
                // debugger;
                ToggleNavMenu("keyboard");
            }
            // Se sair do menu pelo início (pelo botão)
            if (navButton.contains(focusedElement) && navButton.ariaExpanded === "true" && e.shiftKey === true) {
                ToggleNavMenu("keyboard");
            }
            if (optionsList[0] && e.shiftKey === true) {
                alert("fechar o menu opções");
            }
            if (optionsList[optionsList.length - 1] && e.shiftKey === false) {
                alert("fechar o menu opções");
            }
        }
    }
});

document.querySelectorAll("#options li label").forEach((label) => {
    label.addEventListener("click", (e) => {
        // e.preventDefault();
        // label.parentElement.blur();
        label.parentElement.querySelector("input").click();
    });
});

document.addEventListener("keyup", (e) => {
    // keyPressed = false;
    // holdTime = 0;
    currentKeys.splice(e.key);
});

function ToggleNavMenu(input) {
    // console.log(input);
    // debugger;
    const menuList = document.querySelector("#main-nav ul");
    const background = document.querySelector("#background");

    navButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });

    // if (option === undefined) {
    if (menuList.ariaHidden === "true") {
        // console.log("A tentar mostrar");

        menuList.ariaHidden = "false"; // mostra o menu e informa que está visível
        navButton.ariaExpanded = "true";
        background.classList.replace("menu-closed", "menu-open");

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

        // Retorna o foco para o último item do main (ou inicia o foco)
        if (lastFocusedElement === document.body && input !== "mouse") document.querySelector("main section").focus();
        else {
            // debugger;
            document.activeElement.blur();

            // console.log(document.activeElement, lastFocusedElement);

            // Se o input vier to teclado ou do comando
            if (input !== "mouse") {
                lastFocusedElement.focus();
            } else {
                lastFocusedElement === document.body;
            }
        }
    }

    // Tira o foco do ícone de navegação (mas o problema é o hover, não o focus)
    if (document.activeElement === navButton) navButton.blur();
}

function ToggleAccessOptions(input) {
    // debugger;

    // Se esta função for ativada pelo teclado (Enter), altera o input para o teclado em vez do rato
    if (currentKeys.includes("Enter")) input = "keyboard";

    const options = document.querySelector("#options");

    const menuList = document.querySelector("#main-nav ul");
    const background = document.querySelector("#background");

    // const style = window.getComputedStyle(background);

    // if (option === undefined) {
    if (options.ariaHidden === "true") {
        // console.log("A tentar mostrar");

        options.ariaHidden = "false"; // mostra o menu e informa que está visível
        background.classList.replace("menu-open", "options-open");

        const menuFirstOption = options.querySelector("[tabindex='0']");
        // console.log(menuFirstOption);

        menuFirstOption.focus();
        if (input === "mouse") document.activeElement.blur();
    } else if (options.ariaHidden === "false") {
        // console.log("A tentar esconder");

        document.activeElement.blur(); // tira o foco atual

        options.ariaHidden = "true"; // esconde o menu e informa que está escondido
        background.classList.replace("options-open", "menu-open");

        const accessOptionsButton = document.querySelector("#accessibility-button");
        // console.log(accessOptionsButton);
        accessOptionsButton.focus();
        // Se o input vier to teclado ou do comando
        if (input === "mouse") document.activeElement.blur();
    }
}

function EnterSelection() {
    // debugger;

    const childrenArray = Array.from(document.activeElement.children);

    if (document.activeElement !== document.body) {
        // if (document.activeElement.tagName === "SECTION")
        for (let i = 0; i < childrenArray.length; i++) {
            // Vai à procura do primeiro link ou botão que encontre para lhe dar foco
            const interactibleChild = childrenArray[i].querySelector("a, button, input, [tabindex='0']");

            if (interactibleChild) {
                interactibleChild.focus({ focusVisible: true });
                break;
            }
        }
    } else return;
}

function ExitSelection() {
    // debugger;

    if (document.activeElement.tagName !== "SECTION" && document.activeElement.tagName !== "FOOTER") {
        const focusedElement = document.activeElement;

        let parent = focusedElement.parentElement;
        do {
            parent = parent.parentElement;
        } while (parent.tagName !== "SECTION" && parent.tagName !== "FOOTER");

        parent.focus({ focusVisible: true });

        // alert("falta programar esta parte!");
    } else return;
}

function MoveSelection(direction, columnOrRow) {
    if (direction !== 1 && direction !== -1) console.error("Direção não definida!");
    if (columnOrRow !== "row" && columnOrRow !== "column") console.error("Disposição não definida!");

    const focusedElement = document.activeElement;

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const navList = document.querySelector("#nav-list");
    const options = document.querySelector("#options");

    if (
        main.contains(focusedElement) ||
        footer.contains(focusedElement) ||
        navList.contains(focusedElement) ||
        options.contains(focusedElement)
    ) {
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
                const input = parent.querySelector("input");
                if (input) {
                    if (input.type === "range") {
                        if (direction === 1) {
                            input.stepUp();
                            // accessOptions.
                        } else if (direction === -1) {
                            input.stepDown();
                        }
                        return;
                    }
                }
            }

            let i = elementIndex + direction;

            // Isto é o loop dos irmãos do elemento atual
            while (i >= 0 && i <= elementList.length - 1) {
                // Isto acontece quando o foco vai para o header ou para o footer a partir do main
                if (!main.contains(elementList[i]) && main.contains(currentNode)) {
                    // debugger;

                    if (elementList[i] === footer && columnOrRow === "column") {
                        footer.focus({ focusVisible: true });
                        return;

                        // alert("yey");
                    }

                    // // Quando acaba de navegar pelo site, o foco passa para a secção que engloba o elemento que estava em foco
                    // let element = lastFocusedElement;
                    // while (element.tagName !== "SECTION") {
                    //     element = element.parentElement;
                    // }
                    // // console.log(element);
                    // element.focus({ focusVisible: true });
                    // return;
                }
                // E este é o comportamento dentro do main
                else {
                    if (elementList[i].tagName === "SECTION" && columnOrRow === "column") {
                        elementList[i].focus({ focusVisible: true });
                        return;
                    } else {
                        // debugger;

                        // Por algum motivo, isto impede que o foco passe para o botão de navegação
                        if (
                            columnOrRow === "column" &&
                            navList.contains(currentNode) &&
                            !navList.contains(elementList[i])
                        ) {
                            return;
                        }

                        // Se por acaso o foco passar para dentro de um dos botões de foco, ignora-os
                        if (document.querySelector("#scroll-buttons").contains(elementList[i])) {
                            // debugger;
                            i += direction;
                            continue;
                        }

                        // Se o foco estiver no menu de opções, impede que saia do mesmo
                        if (
                            columnOrRow === "column" &&
                            options.contains(currentNode) &&
                            !options.contains(elementList[i])
                        ) {
                            return;
                        }

                        if (columnOrRow === "column") {
                            // Se vier do footer e passar para o main
                            if (currentNode === footer && elementList[i].tagName === "MAIN") {
                                if (elementList[i].querySelector("section")) {
                                    const mainChildren = Array.from(main.children);
                                    mainChildren[mainChildren.length - 1].focus({ focusVisible: true });
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
                                if (elementList[i].matches("a, button, input, [tabindex='0']")) {
                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                    elementList[i].focus({ focusVisible: true });
                                    return;
                                } else if (elementList[i].querySelector("a, button, input, [tabindex='0']")) {
                                    // se o próximo/anterior item contiver um <a> ou <button>, foca no que encontrar primeiro
                                    elementList[i]
                                        .querySelector("a, button, input, [tabindex='0']")
                                        .focus({ focusVisible: true });
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
                                if (elementList[i].matches("a, button, input, [tabindex='0']")) {
                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                    elementList[i].focus({ focusVisible: true });
                                    return;
                                } else if (elementList[i].querySelector("a, button, input, [tabindex='0']")) {
                                    // se o próximo/anterior item contiver um <a> ou <button>, foca no que encontrar primeiro
                                    elementList[i]
                                        .querySelector("a, button, input, [tabindex='0']")
                                        .focus({ focusVisible: true });
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
            navList.querySelector("li > a").focus();

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

// Tem de ser feito um loop de cada frame para que se possa detetar os botões
function MainLoop() {
    const currentFrame = performance.now();

    // console.log(navigator.getGamepads());

    // Caso sem querer atribua o index 1 e o 0 estiver vazio, por exemplo
    const gamepad = navigator.getGamepads().filter((g) => g !== null)[0];
    // console.log(gamepad);

    const focusedElement = document.activeElement;

    // console.log(currentKeys);

    if (gamepad) {
        if (gamepad.mapping === "standard") {
            // Isto trata de scrollar na página
            if (Math.abs(gamepad.axes[3]) >= 0.07) {
                window.scrollBy({ left: 0, top: gamepad.axes[3] * 2 * deltaTime, behavior: "instant" });
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

            // Ações de PRESSIONAR um botão
            const buttonPressActions = {
                0: () => {
                    // Xis
                    if (
                        focusedElement.tagName === "A" ||
                        focusedElement.tagName === "BUTTON" ||
                        focusedElement.tagName === "INPUT"
                    ) {
                        focusedElement.click();
                    } else if (
                        document.querySelector("#options").contains(focusedElement) &&
                        focusedElement.tagName === "LABEL"
                    ) {
                        focusedElement.parentElement.querySelector("input").click();
                    } else {
                        EnterSelection();
                    }
                },
                1: () => {
                    // Círculo
                    // Se estiver o menu nav aberto, fecha o menu
                    if (navButton.ariaExpanded === "true" && document.querySelector("#options").ariaHidden === "true")
                        ToggleNavMenu("gamepad");
                    // Se o menu de opções estiver aberto, fecha as opções e volta para o menu nav
                    else if (
                        navButton.ariaExpanded === "true" &&
                        document.querySelector("#options").ariaHidden === "false"
                    )
                        ToggleAccessOptions("gamepad");
                    // Se o menu nav não estiver aberto, retira o foco atual e passa para a respetiva secção
                    else if (!document.querySelector("header").contains(focusedElement)) ExitSelection();
                },
                // 3: () => {
                //     // Triângulo
                //     if (focusedElement === linkButton) linkButton.blur();
                //     else linkButton.focus();
                // },
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
                    // Inicia o foco automaticamente caso o utilizador não queira abrir imediatamente o menu
                    if (focusedElement === document.body && lastFocusedElement === document.body) {
                        if (!currentButtons[9] > 0) {
                            document.querySelector("section").focus({ focusVisible: true });
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

            // Avalia o estadoa tual do analógico esquerdo (só verticalmente) e move a seleção
            if (currentAxes[1] <= -1 && previousAxes[1] > -1) {
                MoveSelection(-1, "column");
            }
            if (currentAxes[1] >= 1 && previousAxes[1] < 1) {
                MoveSelection(1, "column");
            }
            if (currentAxes[0] <= -1 && previousAxes[0] > -1) {
                MoveSelection(-1, "row");
            }
            if (currentAxes[0] >= 1 && previousAxes[0] < 1) {
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

    // if (document.querySelector("#main-nav").contains(focusedElement) && navButton.ariaExpanded === "true") {
    //     ToggleNavMenu(, undefined);
    // }

    // Se o utilizador der scroll à página quando o menu está aberto, o menu fecha automaticamente
    // window.addEventListener("scroll", (e) => {
    //     // debugger;
    //     if (navButton.ariaExpanded === "true") {
    //         if (gamepad && Math.abs(gamepad.axes[3]) >= 0.15) ToggleNavMenu("gamepad");
    //         // else ToggleNavMenu("mouse");
    //     }
    // });

    // Os botões de scroll
    const scrollUp = document.querySelector("#scroll-up button");
    const scrollDown = document.querySelector("#scroll-down button");

    // console.log(window.scrollY, document.body.clientHeight - window.innerHeight);

    // Isto trata de desativar os botões de scroll quando eles não vao fazer efetivamente nada
    if (window.scrollY === 0) {
        scrollUp.disabled = true;
        scrollUp.ariaDisabled = "true";
    } else {
        scrollUp.disabled = false;
        scrollUp.ariaDisabled = "false";
    }
    if (Math.abs(window.scrollY - (document.body.clientHeight - window.innerHeight)) <= 1) {
        scrollDown.disabled = true;
        scrollDown.ariaDisabled = "true";
    } else {
        scrollDown.disabled = false;
        scrollDown.ariaDisabled = "false";
    }

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
    if (
        focusedElement !== document.body &&
        (document.querySelector("main").contains(focusedElement) ||
            document.querySelector("footer").contains(focusedElement))
    ) {
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

    console.log(focusedElement, lastFocusedElement);

    deltaTime = currentFrame - lastFrame; // tempo atual menos o tempo da frame anterior

    lastFrame = currentFrame;
    // console.log(deltaTime);

    // Reinicia o loop
    requestAnimationFrame(MainLoop);
}
MainLoop();
