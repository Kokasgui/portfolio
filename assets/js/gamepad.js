import { ToggleNavMenu, EnterSelection, ExitSelection, MoveSelection } from "./main.js";

let toolbarButtons = {
    // Isto vai definir o texto associado a cada botão
    0: "Selecionar", // Xis / A
    1: "Voltar", // Círculo / B
    3: "Opções", // Triângulo, X
};
let otherButtons = 9; // Start / Menu

let gamepadVendorID = null;
let gamepadProductID = null;

export let previousButtons = []; // no final de cada frame, vai guardar as informações dos botões

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
