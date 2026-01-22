/**
 * Seed data for exercise library - ~50 basic exercises in Portuguese
 * Video URLs are YouTube video IDs (not full URLs)
 */
export interface SeedExercise {
    name: string;
    muscle_group: string;
    video_url: string | null;
    instructions: string;
    default_rest_seconds: number;
}

export const SEED_EXERCISES: SeedExercise[] = [
    // ===== PEITO =====
    {
        name: "Supino Reto com Barra",
        muscle_group: "Peito",
        video_url: "rT7DgCr-3pg",
        instructions: "Deite no banco, pés no chão. Desça a barra até o peito e empurre para cima.",
        default_rest_seconds: 90
    },
    {
        name: "Supino Inclinado com Halteres",
        muscle_group: "Peito",
        video_url: "8iPEnn-ltC8",
        instructions: "Banco inclinado a 30-45°. Desça os halteres até o nível do peito.",
        default_rest_seconds: 90
    },
    {
        name: "Supino Declinado",
        muscle_group: "Peito",
        video_url: "LfyQBUKR8SE",
        instructions: "Banco declinado. Foco na parte inferior do peitoral.",
        default_rest_seconds: 90
    },
    {
        name: "Crucifixo com Halteres",
        muscle_group: "Peito",
        video_url: "eozdVDA78K0",
        instructions: "Mantenha leve flexão nos cotovelos. Abra os braços em arco.",
        default_rest_seconds: 60
    },
    {
        name: "Crossover na Polia",
        muscle_group: "Peito",
        video_url: "taI4XduLpTk",
        instructions: "Polias altas. Cruze as mãos na frente do corpo.",
        default_rest_seconds: 60
    },
    {
        name: "Flexão de Braço",
        muscle_group: "Peito",
        video_url: "IODxDxX7oi4",
        instructions: "Corpo reto, desça até o peito quase tocar o chão.",
        default_rest_seconds: 45
    },

    // ===== COSTAS =====
    {
        name: "Puxada Frontal",
        muscle_group: "Costas",
        video_url: "CAwf7n6Luuc",
        instructions: "Puxe a barra até o queixo, cotovelos para baixo e para trás.",
        default_rest_seconds: 90
    },
    {
        name: "Remada Curvada",
        muscle_group: "Costas",
        video_url: "FWJR5Ve8bnQ",
        instructions: "Incline o tronco, puxe a barra em direção ao abdômen.",
        default_rest_seconds: 90
    },
    {
        name: "Remada Unilateral",
        muscle_group: "Costas",
        video_url: "pYcpY20QaE8",
        instructions: "Apoie um joelho e mão no banco. Puxe o halter até a cintura.",
        default_rest_seconds: 60
    },
    {
        name: "Remada Cavalinho",
        muscle_group: "Costas",
        video_url: "xQNrFHEMhI4",
        instructions: "Sentado na máquina, puxe a barra em direção ao peito.",
        default_rest_seconds: 90
    },
    {
        name: "Pulldown com Triângulo",
        muscle_group: "Costas",
        video_url: "OGvYAIHqfBQ",
        instructions: "Pegada neutra, puxe até o peito.",
        default_rest_seconds: 60
    },
    {
        name: "Barra Fixa",
        muscle_group: "Costas",
        video_url: "eGo4IYlbE5g",
        instructions: "Suba até o queixo passar a barra.",
        default_rest_seconds: 120
    },

    // ===== OMBROS =====
    {
        name: "Desenvolvimento com Halteres",
        muscle_group: "Ombros",
        video_url: "qEwKCR5JCog",
        instructions: "Sentado ou em pé, empurre os halteres acima da cabeça.",
        default_rest_seconds: 90
    },
    {
        name: "Desenvolvimento Militar",
        muscle_group: "Ombros",
        video_url: "2yjwXTZQDDI",
        instructions: "Em pé, empurre a barra da frente do ombro até acima.",
        default_rest_seconds: 90
    },
    {
        name: "Elevação Lateral",
        muscle_group: "Ombros",
        video_url: "3VcKaXpzqRo",
        instructions: "Levante os braços lateralmente até a altura dos ombros.",
        default_rest_seconds: 45
    },
    {
        name: "Elevação Frontal",
        muscle_group: "Ombros",
        video_url: "sOcYlBI85hc",
        instructions: "Levante os braços à frente até a altura dos ombros.",
        default_rest_seconds: 45
    },
    {
        name: "Crucifixo Inverso",
        muscle_group: "Ombros",
        video_url: "5YK4bgzXDp0",
        instructions: "Inclinado para frente, abra os braços lateralmente.",
        default_rest_seconds: 45
    },
    {
        name: "Encolhimento com Halteres",
        muscle_group: "Ombros",
        video_url: "cJRVVxmytaM",
        instructions: "Suba os ombros em direção às orelhas (trapézio).",
        default_rest_seconds: 60
    },

    // ===== BÍCEPS =====
    {
        name: "Rosca Direta com Barra",
        muscle_group: "Bíceps",
        video_url: "kwG2ipFRgfo",
        instructions: "Cotovelos fixos ao lado do corpo, suba a barra.",
        default_rest_seconds: 60
    },
    {
        name: "Rosca Alternada",
        muscle_group: "Bíceps",
        video_url: "sAq_ocpRh_I",
        instructions: "Alterne os braços, supine ao subir.",
        default_rest_seconds: 60
    },
    {
        name: "Rosca Scott",
        muscle_group: "Bíceps",
        video_url: "vngli9UR6Hw",
        instructions: "Braços apoiados no banco Scott, isole o bíceps.",
        default_rest_seconds: 60
    },
    {
        name: "Rosca Martelo",
        muscle_group: "Bíceps",
        video_url: "zC3nLlEvin4",
        instructions: "Pegada neutra, trabalha braquial.",
        default_rest_seconds: 60
    },
    {
        name: "Rosca Concentrada",
        muscle_group: "Bíceps",
        video_url: "0AUGkch3tzc",
        instructions: "Sentado, cotovelo apoiado na coxa.",
        default_rest_seconds: 45
    },

    // ===== TRÍCEPS =====
    {
        name: "Tríceps Pulley",
        muscle_group: "Tríceps",
        video_url: "2-LAMcpzODU",
        instructions: "Cotovelos fixos, empurre a barra para baixo.",
        default_rest_seconds: 60
    },
    {
        name: "Tríceps Testa",
        muscle_group: "Tríceps",
        video_url: "d_KZxkY_0cM",
        instructions: "Deitado, desça a barra até a testa.",
        default_rest_seconds: 60
    },
    {
        name: "Tríceps Francês",
        muscle_group: "Tríceps",
        video_url: "YbX7Wd8jQ-Q",
        instructions: "Halter atrás da cabeça, estenda os braços.",
        default_rest_seconds: 60
    },
    {
        name: "Mergulho no Banco",
        muscle_group: "Tríceps",
        video_url: "6kALZikXxLc",
        instructions: "Mãos no banco atrás, desça o corpo.",
        default_rest_seconds: 60
    },
    {
        name: "Tríceps Coice",
        muscle_group: "Tríceps",
        video_url: "ZO81bExngMI",
        instructions: "Inclinado, estenda o braço para trás.",
        default_rest_seconds: 45
    },

    // ===== PERNAS - QUADRÍCEPS =====
    {
        name: "Agachamento Livre",
        muscle_group: "Quadríceps",
        video_url: "ultWZbUMPL8",
        instructions: "Barra nas costas, desça até 90° ou mais.",
        default_rest_seconds: 120
    },
    {
        name: "Leg Press 45°",
        muscle_group: "Quadríceps",
        video_url: "IZxyjW7MPJQ",
        instructions: "Pés na plataforma, desça controladamente.",
        default_rest_seconds: 90
    },
    {
        name: "Agachamento Hack",
        muscle_group: "Quadríceps",
        video_url: "0tn5K9NlCfo",
        instructions: "Na máquina hack, costas apoiadas.",
        default_rest_seconds: 90
    },
    {
        name: "Cadeira Extensora",
        muscle_group: "Quadríceps",
        video_url: "YyvSfVjQeL0",
        instructions: "Estenda as pernas completamente.",
        default_rest_seconds: 60
    },
    {
        name: "Afundo",
        muscle_group: "Quadríceps",
        video_url: "QOVaHwm-Q6U",
        instructions: "Passo à frente, joelho de trás quase toca o chão.",
        default_rest_seconds: 60
    },
    {
        name: "Passada",
        muscle_group: "Quadríceps",
        video_url: "L8fvypPrzzs",
        instructions: "Caminhe com passos longos alternados.",
        default_rest_seconds: 60
    },

    // ===== PERNAS - POSTERIOR =====
    {
        name: "Mesa Flexora",
        muscle_group: "Posterior",
        video_url: "1Tq3QdYUuHs",
        instructions: "Deitado, flexione as pernas.",
        default_rest_seconds: 60
    },
    {
        name: "Cadeira Flexora",
        muscle_group: "Posterior",
        video_url: "Orxowest56U",
        instructions: "Sentado, flexione as pernas.",
        default_rest_seconds: 60
    },
    {
        name: "Stiff",
        muscle_group: "Posterior",
        video_url: "1uDiW5djGm8",
        instructions: "Pernas semiflexionadas, desça o peso.",
        default_rest_seconds: 90
    },
    {
        name: "Levantamento Terra",
        muscle_group: "Posterior",
        video_url: "op9kVnSso6Q",
        instructions: "Levante a barra do chão com as costas retas.",
        default_rest_seconds: 120
    },

    // ===== PERNAS - GLÚTEOS =====
    {
        name: "Elevação Pélvica",
        muscle_group: "Glúteos",
        video_url: "SEdqd1n0icg",
        instructions: "Costas no chão, eleve o quadril.",
        default_rest_seconds: 60
    },
    {
        name: "Abdução de Quadril",
        muscle_group: "Glúteos",
        video_url: "FaHXwdkwkpU",
        instructions: "Na máquina, abra as pernas.",
        default_rest_seconds: 45
    },
    {
        name: "Coice na Polia",
        muscle_group: "Glúteos",
        video_url: "bS5I8UhROxw",
        instructions: "Chute a perna para trás contra a resistência.",
        default_rest_seconds: 45
    },

    // ===== PERNAS - PANTURRILHA =====
    {
        name: "Panturrilha em Pé",
        muscle_group: "Panturrilha",
        video_url: "c5Kv6-fnTj8",
        instructions: "Suba nas pontas dos pés.",
        default_rest_seconds: 45
    },
    {
        name: "Panturrilha Sentado",
        muscle_group: "Panturrilha",
        video_url: "Y0Z41o_71co",
        instructions: "Sentado na máquina, suba os calcanhares.",
        default_rest_seconds: 45
    },

    // ===== ABDÔMEN =====
    {
        name: "Abdominal Crunch",
        muscle_group: "Abdômen",
        video_url: "Xyd_fa5zoEU",
        instructions: "Deitado, eleve os ombros do chão.",
        default_rest_seconds: 30
    },
    {
        name: "Abdominal Infra",
        muscle_group: "Abdômen",
        video_url: "l4kQd9eWclE",
        instructions: "Eleve as pernas e o quadril.",
        default_rest_seconds: 30
    },
    {
        name: "Prancha",
        muscle_group: "Abdômen",
        video_url: "ASdvN_XEl_c",
        instructions: "Mantenha o corpo reto apoiado nos antebraços.",
        default_rest_seconds: 60
    },
    {
        name: "Abdominal na Máquina",
        muscle_group: "Abdômen",
        video_url: "3D5KWsYAqKk",
        instructions: "Flexione o tronco contra a resistência.",
        default_rest_seconds: 45
    },
    {
        name: "Oblíquo com Rotação",
        muscle_group: "Abdômen",
        video_url: "pAplQXk3dkU",
        instructions: "Gire o tronco alternando os lados.",
        default_rest_seconds: 30
    },

    // ===== CARDIO =====
    {
        name: "Corrida na Esteira",
        muscle_group: "Cardio",
        video_url: null,
        instructions: "Aqueça 5 min, mantenha ritmo constante.",
        default_rest_seconds: 0
    },
    {
        name: "Bike Ergométrica",
        muscle_group: "Cardio",
        video_url: null,
        instructions: "Pedale em ritmo moderado a intenso.",
        default_rest_seconds: 0
    },
    {
        name: "Elíptico",
        muscle_group: "Cardio",
        video_url: null,
        instructions: "Movimento fluido de pernas e braços.",
        default_rest_seconds: 0
    }
];
