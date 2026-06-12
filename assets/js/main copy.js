let deltaTime = 0;

// Isto serve só para este primeiro teste, depois o focus vai saltar entre cada elemento, pensando em elementos pai e filhos
const linkButton = document.querySelector(".button-link > a");
const navButton = document.querySelector("#main-nav #nav-icon button");

const toolbar = document.querySelector("#toolbar");

let lastFocusedElement = document.body;

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
    ToggleNavMenu("close");
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
                // Para averiguar com a Ana e a Mariana

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

// Isto retira o foco das secções sempre que se utiliza o rato em vez do comando ou do teclado
document.querySelectorAll("section").forEach((section) => {
    section.addEventListener("click", (e) => {
        // e.preventDefault();
        section.blur();
    });
});

document.addEventListener("keyup", (e) => {
    // keyPressed = false;
    // holdTime = 0;
    currentKeys.splice(e.key);
});

function ToggleNavMenu(option) {
    // console.log(option);
    // debugger;
    const menuList = document.querySelector("#main-nav ul");
    const background = document.querySelector("#background");

    if (option === undefined) {
        if (menuList.ariaHidden === "true") {
            // console.log("A tentar mostrar");

            menuList.ariaHidden = "false"; // mostra o menu e informa que está visível
            navButton.ariaExpanded = "true";
            background.classList.replace("menu-closed", "menu-open");

            const menuFirstOption = menuList.querySelector("li:first-of-type > a");
            // console.log(menuFirstOption);
            menuFirstOption.focus();
        } else if (menuList.ariaHidden === "false") {
            // console.log("A tentar esconder");

            // document.activeElement.blur(); // tira o foco atual

            // Retorna o foco para o último item do main (ou inicia o foco)
            if (lastFocusedElement === document.body) document.querySelector("main section").focus();
            else lastFocusedElement.focus();

            menuList.ariaHidden = "true"; // esconde o menu e informa que está escondido
            navButton.ariaExpanded = "false";
            background.classList.replace("menu-open", "menu-closed");
        }
    } else {
        if (option === "close") {
            if (menuList.ariaHidden === "false") {
                // console.log("A tentar esconder");

                document.activeElement.blur(); // tira o foco atual
                menuList.ariaHidden = "true"; // esconde o menu e informa que está escondido
                navButton.ariaExpanded = "false";
                background.classList.replace("menu-open", "menu-closed");

                // Retorna o foco para o último item do main (ou inicia o foco)
                if (lastFocusedElement === document.body) document.querySelector("main section").focus();
                else lastFocusedElement.focus();
            }
        }
    }
}

function EnterSelection() {
    // debugger;

    const childrenArray = Array.from(document.activeElement.children);

    if (document.activeElement !== document.body) {
        // if (document.activeElement.tagName === "SECTION")
        for (let i = 0; i < childrenArray.length; i++) {
            // Vai à procura do primeiro link ou botão que encontre para lhe dar foco
            const interactibleChild = childrenArray[i].querySelector("a, button");

            if (interactibleChild) {
                interactibleChild.focus();
                break;
            }
        }
    } else return;
}

function ExitSelection() {
    // debugger;

    if (document.activeElement.tagName !== "SECTION") {
        const focusedElement = document.activeElement;

        let parent = focusedElement.parentElement;
        do {
            parent = parent.parentElement;
        } while (parent.tagName !== "SECTION");

        parent.focus();

        // alert("falta programar esta parte!");
    } else return;
}

function MoveSelection(direction) {
    // debugger;

    if (direction !== 1 && direction !== -1) console.error("Direção não definida!");

    const focusedElement = document.activeElement;

    if (document.querySelector("main").contains(focusedElement)) {
        let parent = focusedElement.parentElement;
        let elementIndex;
        let elementList;

        if (parent.tagName === "LI") {
            // primeiro, isto deteta se o parent é um item de lista, porque assim tem de navegar pela lista
            parent = parent.parentElement; // define o parent como o ul
            elementList = Array.from(parent.children);
            elementIndex = elementList.indexOf(focusedElement.parentElement); // procura o índice do item da lista
        } else {
            // se não for um item de lista, opera de forma mais simples
            if (focusedElement.tagName !== "SECTION") {
                // Assim garante que o parent seja uma <section> e trabalha a partir daí
                do {
                    parent = parent.parentElement;
                } while (parent.tagName !== "SECTION");

                elementList = Array.from(parent.children); // assume que o parent é a <section>

                for (let i = 0; i < elementList.length; i++) {
                    if (elementList[i].contains(focusedElement)) {
                        // se o parent do link focado estiver no index 1 da secção vai usar esse index como base
                        elementIndex = i;
                    }
                }
            } else {
                elementList = Array.from(parent.children);
                elementIndex = elementList.indexOf(focusedElement);
            }
        }

        debugger;

        if (direction === 1 && elementList[elementIndex + direction].querySelector("a, button")) {
            // ISTO TEM DE MUDAR DE SECTION
            if (document.querySelector("#main-nav").contains(focusedElement) || focusedElement.tagName === "SECTION")
                return; // se estiver no fim da lista e quiser descer, cancela
            else {
                let focusedElement = document.activeElement;

                let parent = focusedElement.parentElement;
                do {
                    parent = parent.parentElement;
                } while (parent.tagName !== "SECTION");

                parent.focus(); // dá foco à section atual
                focusedElement = document.activeElement;
                // focusedElement.blur();

                parent = focusedElement.parentElement;
                elementList = Array.from(parent.children);
                elementIndex = elementList.findIndex((n) => n === focusedElement);

                elementList[elementIndex + direction].focus();

                // alert("tem de se programar esta parte para avançar para a próxima secção");
            }
        } else if (direction === -1 && elementIndex === 0) {
            // ISTO TEM DE MUDAR DE SECTION
            if (document.querySelector("#main-nav").contains(focusedElement) || focusedElement.tagName === "SECTION")
                return; // se estiver no fim da lista e quiser descer, cancela
            else {
                let focusedElement = document.activeElement;

                let parent = focusedElement.parentElement;
                do {
                    parent = parent.parentElement;
                } while (parent.tagName !== "SECTION");

                parent.focus(); // dá foco à section atual
                focusedElement = document.activeElement;
                focusedElement.blur();

                parent = focusedElement.parentElement;
                elementList = Array.from(parent.children);

                console.log(elementList);

                elementIndex = elementList.findIndex((n) => n === focusedElement);

                elementList[elementIndex + direction].focus();

                // alert("tem de se programar esta parte para recuar para a próxima secção");
            }
        } else {
            const newElement = elementList[elementIndex + direction];

            if (focusedElement.tagName !== "SECTION") {
                if (newElement.matches("a, button")) newElement.focus(); // se o elemento novo seja um link ou botão
                if (newElement.querySelector("a, button")) {
                    // se existir um link ou botão dentro do novo elemento

                    newElement.querySelector("a, button").focus({ focusVisible: true });
                }
            } else newElement.focus({ focusVisible: true });

            // if (newElement.tagName === "A") {
            //     newElement.focus(); // se o novo elemento de foco for um link, dá logo foco
            // } else if (newElement.tagName === "LI" && newElement.firstChild.tagName === "A") {
            //     // se for um item de lista e tiver um link lá dentro então dá foco nesse link
            //     newElement.firstChild.focus();
            // }
        }
    } else {
        // console.log(lastFocusedElement);

        if (lastFocusedElement === document.body) {
            document.querySelector("main section").focus();
        } else lastFocusedElement.focus({ focusVisible: true });
        // por exemplo, ao fechar o menu, perde-se o foco, então isto faz com que o foco volte para o elemento em que se estava
    }
}

function Scroll(direction) {
    window.scrollBy(0, (window.innerHeight / 2) * direction);
}

let previousButtons = []; // no final de cada frame, vai guardar as informações dos botões

let lastFrame = performance.now();

// Tem de ser feito um loop de cada frame para que se possa detetar os botões
function MainLoop() {
    const currentFrame = performance.now();

    const gamepad = navigator.getGamepads()[0];
    const focusedElement = document.activeElement;

    // console.log(gamepad);

    // console.log(currentKeys);

    if (gamepad) {
        // Supostamente isto devia scrollar
        if (gamepad.mapping === "standard") {
            if (Math.abs(gamepad.axes[3]) >= 0.07) {
                window.scrollBy({ left: 0, top: gamepad.axes[3] * 30, behavior: "instant" });
            }
        }

        // Isto apenas faz um array dos valores de todos os botões
        const currentButtons = gamepad.buttons.map((b) => b.value);

        // Apenas basta adicionar quando uma tecla é pressionada
        if (currentKeys.length > 0 || !currentButtons.every((b) => b === 0)) holdTime += deltaTime;
        else holdTime = 0;

        // console.log(holdTime);

        // No momento em que o comando é detetado, assume que no frame anterior nenhum botão foi pressionado
        if (previousButtons[0] === undefined) {
            previousButtons = currentButtons.map((b) => 0);
            // console.log("previousButtons", previousButtons);
        }

        // Ações de PRESSIONAR um botão
        const buttonPressActions = {
            0: () => {
                // Xis
                if (focusedElement.tagName === "A" || focusedElement.tagName === "BUTTON") {
                    focusedElement.click();
                } else EnterSelection();
            },
            1: () => {
                // Círculo
                // Se estiver o menu aberto, fecha o menu
                if (document.querySelector("#main-nav").contains(focusedElement)) ToggleNavMenu("close");
                // Se não estiver o menu aberto, retira o foco atual e passa para a respetiva secção
                else if (document.querySelector("main").contains(focusedElement)) ExitSelection();
            },
            // 3: () => {
            //     // Triângulo
            //     if (focusedElement === linkButton) linkButton.blur();
            //     else linkButton.focus();
            // },
            9: () => {
                // Start
                ToggleNavMenu();
            },
            12: () => {
                // D-pad up
                MoveSelection(-1);
            },
            13: () => {
                // D-pad down
                MoveSelection(1);
            },
        };

        // Ações de LARGAR um botão
        const buttonReleaseActions = {};

        const buttonHoldActions = {
            12: () => {
                // D-pad up
                MoveSelection(-1);
            },
            13: () => {
                // D-pad down
                MoveSelection(1);
            },
        };

        // Avalia o estado atual e anterior dos botões e realiza as ações respetivas
        for (let b = 0; b < currentButtons.length; b++) {
            // Ação PRESS
            if (currentButtons[b] > 0 && previousButtons[b] === 0) {
                if (buttonPressActions[b]) buttonPressActions[b]();
            }
            // Ação RELEASE
            if (currentButtons[b] === 0 && previousButtons[b] > 0) {
                if (buttonReleaseActions[b]) buttonReleaseActions[b]();
            }
            // Ação HOLD
            if (currentButtons[b] > 0 && previousButtons[b] > 0 && holdTime > 750) {
                if (buttonHoldActions[b]) buttonHoldActions[b]();
            }
        }

        previousButtons = currentButtons;
    } else {
        // Apenas basta adicionar quando uma tecla é pressionada
        if (currentKeys.length > 0) holdTime += deltaTime;
        else holdTime = 0;

        // console.log(holdTime);
    }

    // if (navButton.ariaExpanded === "true") {
    //     if (!document.querySelector("#main-nav").contains(focusedElement)) ToggleNavMenu("close");
    // }

    // Se o utilizador der scroll à página quando o menu está aberto, o menu fecha automaticamente
    window.addEventListener("scroll", (e) => {
        if (navButton.ariaExpanded === "true") ToggleNavMenu("close");
    });

    // console.log(focusedElement);

    // Se o elemento em foco não for algo do menu ou o body, regista esse elemento para se poder regressar ao foco
    if (focusedElement !== document.body && !document.querySelector("#main-nav").contains(focusedElement))
        lastFocusedElement = focusedElement;

    // console.log(lastFocusedElement);

    deltaTime = currentFrame - lastFrame; // tempo atual menos o tempo da frame anterior

    lastFrame = currentFrame;
    // console.log(deltaTime);

    // Reinicia o loop
    requestAnimationFrame(MainLoop);
}
MainLoop();
