/**
 * Frases motivacionais em PT-BR
 */
export const MOTIVATIONAL_QUOTES = [
    "Treina fofo, fica fofo. 💀",
    "O shape não vem de brinde. Vai buscar.",
    "Só vai. Depois cê descansa.",
    "Bora ficar monstro ou vai chorar? 😭",
    "A meta é o espelho ter medo de você.",
    "Se fosse fácil, todo mundo era fit.",
    "Sem dor, sem ganho. O clássico nunca erra.",
    "Levanta esse peso, a gravidade não vai ajudar.",
    "Hoje tá pago? Então corre.",
    "Tá doendo? Que pena. Continua.",
    "Chora agora, ri na praia. 🏖️",
    "Frango não tem opinião. 🐔",
    "Desculpa é pros fracos.",
    "Hoje ninguém vai treinar por você.",
    "A dor passa, o orgulho fica.",
    "Projeto verão? Não, projeto vida toda.",
    "Menos desculpas, mais repetições.",
    "Fecha a cara e treina. 😠",
    "Sua melhor versão tá te esperando na última repetição.",
    "Não conta as reps, faz valer.",
    "Cansou? Aprenda a descansar, não a desistir.",
    "Shape em construção... 🚧",
    "Vem monstro! 💪",
    "Sai do sofá e vai pra guerra.",
    "O corpo alcança o que a mente acredita.",
] as const;

/**
 * Retorna uma citação aleatória
 */
export const getRandomQuote = (): string => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};
