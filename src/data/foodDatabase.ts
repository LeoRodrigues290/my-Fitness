export interface FoodItem {
    id: string;
    name: string;
    calories: number; // per 100g or unit
    protein: number;
    carbs: number;
    fats: number;
    unit: 'g' | 'ml' | 'unidade' | 'colher';
    portion: number; // default portion size in unit
}

export const foodDatabase: FoodItem[] = [
    // PROTEINS
    { id: '1', name: 'Peito de Frango Grelhado', calories: 165, protein: 31, carbs: 0, fats: 3.6, unit: 'g', portion: 100 },
    { id: '2', name: 'Ovo Cozido (Grande)', calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, unit: 'unidade', portion: 1 },
    { id: '3', name: 'Carne Moída (Patinho)', calories: 219, protein: 36, carbs: 0, fats: 7, unit: 'g', portion: 100 },
    { id: '4', name: 'Whey Protein (Dose)', calories: 120, protein: 24, carbs: 3, fats: 1, unit: 'unidade', portion: 1 },
    { id: '5', name: 'Tilápia Grelhada', calories: 128, protein: 26, carbs: 0, fats: 2.7, unit: 'g', portion: 100 },

    // CARBS
    { id: '6', name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, unit: 'g', portion: 100 },
    { id: '7', name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, unit: 'g', portion: 100 },
    { id: '8', name: 'Aveia em Flocos', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, unit: 'g', portion: 100 },
    { id: '9', name: 'Banana Prata (Média)', calories: 98, protein: 1.3, carbs: 26, fats: 0.3, unit: 'unidade', portion: 1 },
    { id: '10', name: 'Macarrão Cozido', calories: 157, protein: 5.8, carbs: 30, fats: 0.9, unit: 'g', portion: 100 },
    { id: '11', name: 'Pão Integral (Fatia)', calories: 69, protein: 3.6, carbs: 12, fats: 0.9, unit: 'unidade', portion: 1 },

    // FATS & OTHERS
    { id: '12', name: 'Azeite de Oliva', calories: 884, protein: 0, carbs: 0, fats: 100, unit: 'ml', portion: 13 }, // 1 colher sopa ~13ml
    { id: '13', name: 'Pasta de Amendoim', calories: 588, protein: 25, carbs: 20, fats: 50, unit: 'g', portion: 100 },

    // SNACKS/MISC
    { id: '14', name: 'Requeijão Light', calories: 41, protein: 2.4, carbs: 0.6, fats: 3.2, unit: 'colher', portion: 1 },
    { id: '15', name: 'Iogurte Natural', calories: 60, protein: 4, carbs: 5, fats: 3, unit: 'unidade', portion: 1 },

    // CUSTOM PLACEHOLDER
    { id: '999', name: 'Outro Alimento', calories: 0, protein: 0, carbs: 0, fats: 0, unit: 'g', portion: 100 },
];

export const searchFood = (query: string): FoodItem[] => {
    const q = query.toLowerCase();
    return foodDatabase.filter(food => food.name.toLowerCase().includes(q));
};
