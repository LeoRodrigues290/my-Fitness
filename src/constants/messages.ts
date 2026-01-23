export const GYM_MESSAGES = {
    ERRORS: [
        "O app treinou até a falha. Tente novamente após o descanso.",
        "Execução incorreta detectada no sistema. Ajustando a postura...",
        "Falha concêntrica no servidor. Dando um spot...",
        "O peso foi demais para o processador. Aliviando a carga...",
        "Drop-set forçado no sistema. Recarregando...",
        "Calculando a carga... tenta de novo monstro."
    ],
    SUCCESS_WORKOUT: [
        "Mais um dia, mais um pump. Tá pago! 💪",
        "BIIIRL! O monstro saiu da jaula! 🦍",
        "O shape vem! Descanso merecido. 💤",
        "Tá pago! Amanhã tem mais. 🔥",
        "É isso aí! Nada pode te parar. 🚀",
        "Hipertrofia garantida. Vai comer! 🍗"
    ],
    SUCCESS_MEAL: [
        "Macros garantidos. O shape agradece. 🥗",
        "Combustível de foguete no tanque! 🚀",
        "Alimentando os ganhos. 💪",
        "Nutrição de elite confirmada. 💎"
    ],
    WATER_GOAL: [
        "Hidratado e perigoso! 💧",
        "Água no tanque. Músculo cheio! 🌊",
        "Rins felizes, shape denso. 🚰"
    ],
    WELCOME: [
        "Hora de esmagar! 🔨",
        "Foco total hoje. 🎯",
        "Bora buscar o pump? 🎈"
    ]
} as const;

export type MessageCategory = keyof typeof GYM_MESSAGES;

export const getRandomMessage = (category: MessageCategory): string => {
    const messages = GYM_MESSAGES[category];
    const index = Math.floor(Math.random() * messages.length);
    return messages[index];
};
