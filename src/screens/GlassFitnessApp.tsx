import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar as RNStatusBar,
  Modal,
  TextInput
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Play,
  Flame,
  Clock,
  Calendar,
  ChevronLeft,
  Dumbbell,
  Activity,
  Home,
  User,
  BarChart2,
  MoreHorizontal,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Settings,
  LogOut,
  Utensils,
  Droplet,
  Beef,
  Wheat,
  Apple,
  Edit2,
  X,
  ChevronDown,
  Plus,
  PlusCircle,
  MinusCircle,
  Save,
  Check,
  Filter
} from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { useUser, WeekSchedule } from '../context/UserContext';

// Calendar Locale Config (PT-BR)
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const { width } = Dimensions.get('window');

// Tailwind Color Palette Map
const colors = {
  slate950: '#020617',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate750: '#2d384d',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  lime500: '#84cc16',
  lime400: '#a3e635',
  lime300: '#bef264',
  blue500: '#3b82f6',
  blue400: '#60a5fa',
  orange400: '#fb923c',
  red500: '#ef4444',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

const GlassFitnessApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'details', 'workouts', 'stats', 'profile'
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'workouts', 'stats', 'nutrition'
  const [showManageProfiles, setShowManageProfiles] = useState(false);
  const [editingUsers, setEditingUsers] = useState<any[]>([]);
  const insets = useSafeAreaInsets();

  // Real User Data from Context
  const { currentUser, setUser, users, userPreferences, updatePreferences, dailyStats, addWorkoutSession } = useUser();

  // Fallback if no user is logged in (though app flow usually requires it)
  const userName = currentUser?.name || "Visitante";

  // Base de Dados de Treinos
  const workoutsData = [
    {
      id: 'chest-triceps',
      title: "Peito & Tríceps",
      subtitle: "Foco em Força",
      duration: "55 min",
      calories: "420 kcal",
      level: "Intermediário",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
      exercises: [
        { id: 1, name: "Supino Inclinado", sets: "4 séries", reps: "10-12 reps", completed: true },
        { id: 2, name: "Crucifixo no Cabo", sets: "3 séries", reps: "12-15 reps", completed: false },
        { id: 3, name: "Tríceps Testa", sets: "4 séries", reps: "10 reps", completed: false },
        { id: 4, name: "Mergulho (Dips)", sets: "3 séries", reps: "Falha", completed: false },
      ]
    },
    {
      id: 'back-biceps',
      title: "Costas & Bíceps",
      subtitle: "Largura e Densidade",
      duration: "60 min",
      calories: "450 kcal",
      level: "Avançado",
      image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2070&auto=format&fit=crop",
      exercises: [
        { id: 1, name: "Barra Fixa (Pull-up)", sets: "4 séries", reps: "8-10 reps", completed: false },
        { id: 2, name: "Remada Curvada", sets: "4 séries", reps: "10-12 reps", completed: false },
        { id: 3, name: "Puxada Alta", sets: "3 séries", reps: "12 reps", completed: false },
        { id: 4, name: "Rosca Direta", sets: "3 séries", reps: "12-15 reps", completed: false },
      ]
    },
    {
      id: 'legs',
      title: "Leg Day (Pernas)",
      subtitle: "Inferiores Completo",
      duration: "65 min",
      calories: "500 kcal",
      level: "Difícil",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
      exercises: [
        { id: 1, name: "Agachamento Livre", sets: "4 séries", reps: "8-10 reps", completed: false },
        { id: 2, name: "Leg Press 45", sets: "4 séries", reps: "12-15 reps", completed: false },
        { id: 3, name: "Cadeira Extensora", sets: "3 séries", reps: "15-20 reps", completed: false },
        { id: 4, name: "Stiff", sets: "3 séries", reps: "12 reps", completed: false },
      ]
    },
    {
      id: 'shoulders-abs',
      title: "Ombros & Abdômen",
      subtitle: "Definição 3D",
      duration: "50 min",
      calories: "380 kcal",
      level: "Intermediário",
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop",
      exercises: [
        { id: 1, name: "Desenvolvimento Militar", sets: "4 séries", reps: "10-12 reps", completed: false },
        { id: 2, name: "Elevação Lateral", sets: "3 séries", reps: "15 reps", completed: false },
        { id: 3, name: "Face Pull", sets: "3 séries", reps: "15 reps", completed: false },
        { id: 4, name: "Prancha Abdominal", sets: "3 séries", reps: "1 min", completed: false },
      ]
    },
    {
      id: 'flow',
      title: "Flow (Full Body)",
      subtitle: "Mobilidade e Suor",
      duration: "45 min",
      calories: "600 kcal",
      level: "Intenso",
      image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop",
      exercises: [
        { id: 1, name: "Burpees", sets: "4 séries", reps: "15 reps", completed: false },
        { id: 2, name: "Kettlebell Swing", sets: "4 séries", reps: "20 reps", completed: false },
        { id: 3, name: "Box Jump", sets: "3 séries", reps: "12 reps", completed: false },
        { id: 4, name: "Man Maker", sets: "3 séries", reps: "10 reps", completed: false },
      ]
    }
  ];

  const [activeWorkout, setActiveWorkout] = useState(workoutsData[0]);

  // Update active workout based on day of week and user schedule
  useEffect(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay();
    const dayName = days[todayIndex] as keyof WeekSchedule;

    const scheduledWorkoutId = userPreferences.schedule[dayName];
    const workout = workoutsData.find(w => w.id === scheduledWorkoutId);

    if (workout) {
      setActiveWorkout(workout);
    } else if (scheduledWorkoutId === 'rest') {
      // If rest, we could either show a "Rest Day" card or just keep default. 
      // For now let's create a visual "Rest" state or just default to flow/stretch if desired.
      // Or we can create a fake 'Rest' workout object.
      const restWorkout = {
        id: 'rest',
        title: "Dia de Descanso",
        subtitle: "Recuperação Ativa",
        duration: "0 min",
        calories: "0 kcal",
        level: "Relax",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop", // calming image
        exercises: []
      };
      // @ts-ignore
      setActiveWorkout(restWorkout);
    }
  }, [userPreferences.schedule]);

  const handleWorkoutClick = (workout: any) => {
    // If it's a rest day object, maybe don't open details or open a specific rest view
    if (workout.id === 'rest') return;
    setActiveWorkout(workout);
    setCurrentScreen('details');
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    setCurrentScreen(tab); // Map tabs to screens
  };

  const handleLogout = () => {
    if (setUser) {
      setUser(null);
      setCurrentScreen('login');
    }
  };

  // --- Screens Components ---

  // --- Screens Components ---

  const LoginScreen = () => (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.slate950 }}>
      {/* Background Image */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" }}
          style={{ width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(2, 6, 23, 0.9)', '#020617']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Content */}
      <SafeAreaView style={{ paddingHorizontal: 32, paddingBottom: 60, alignItems: 'center' }}>
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <View style={{
            width: 64, height: 64, backgroundColor: colors.lime400,
            borderRadius: 16, alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, shadowColor: colors.lime400,
            shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20
          }}>
            <Dumbbell size={32} color={colors.slate900} fill={colors.slate900} />
          </View>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.white, marginBottom: 8 }}>My Fitness</Text>
          <Text style={{ fontSize: 18, color: colors.slate400 }}>Quem vai treinar hoje?</Text>
        </View>

        {/* User Selection Grid */}
        <View style={{ flexDirection: 'row', gap: 24, marginBottom: 40 }}>
          {((users && users.length > 0) ? users : [
            { id: 1, name: "Léo", avatar_uri: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200" },
            { id: 2, name: "Oliver", avatar_uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200" }
          ]).map((user: any, index: number) => (
            <TouchableOpacity
              key={user.id || index}
              onPress={() => {
                if (setUser) setUser(user);
                setCurrentScreen('home');
              }}
              activeOpacity={0.8}
              style={{ alignItems: 'center' }}
            >
              <View style={{
                width: 100, height: 100, borderRadius: 50, borderWidth: 2,
                borderColor: colors.lime400, marginBottom: 12, position: 'relative',
                shadowColor: colors.lime400, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
              }}>
                <Image
                  source={{ uri: user.avatar_uri }}
                  style={{ width: '100%', height: '100%', borderRadius: 50 }}
                />
              </View>
              <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity>
          <Text style={{ color: colors.slate500, fontSize: 14 }}>Gerenciar Perfis</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );

  const HomeScreen = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 20 }}
      showsVerticalScrollIndicator={false}
      style={styles.screenContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
          <Text style={styles.userNameText}>{userName} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => handleTabPress('profile')}>
          <View style={styles.avatarContainer}>
            {currentUser?.avatar_uri ? (
              <Image source={{ uri: currentUser.avatar_uri }} style={styles.avatar} />
            ) : (
              <User size={20} color={colors.white} /> // Fallback icon
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats Cards - New 4 Grid Layout */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
        {/* Calories */}
        <View style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.slate700, alignItems: 'center' }}>
          <Flame size={20} color={colors.orange400} style={{ marginBottom: 8 }} />
          <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>{dailyStats ? dailyStats.caloriesConsumed : 0}</Text>
          <Text style={{ color: colors.slate400, fontSize: 10 }}>/{userPreferences.goals.kcal}</Text>
        </View>
        {/* Protein */}
        <View style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.slate700, alignItems: 'center' }}>
          <Beef size={20} color={colors.red500} style={{ marginBottom: 8 }} />
          <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>{dailyStats ? dailyStats.proteinConsumed : 0}g</Text>
          <Text style={{ color: colors.slate400, fontSize: 10 }}>/{userPreferences.goals.protein}</Text>
        </View>
        {/* Carbs */}
        <View style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.slate700, alignItems: 'center' }}>
          <Wheat size={20} color={colors.lime400} style={{ marginBottom: 8 }} />
          <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>{dailyStats ? dailyStats.carbsConsumed : 0}g</Text>
          <Text style={{ color: colors.slate400, fontSize: 10 }}>/{userPreferences.goals.carbs}</Text>
        </View>
        {/* Water */}
        <View style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.slate700, alignItems: 'center' }}>
          <Droplet size={20} color={colors.blue400} style={{ marginBottom: 8 }} />
          <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>{dailyStats ? dailyStats.waterConsumed / 1000 : 0}L</Text>
          <Text style={{ color: colors.slate400, fontSize: 10 }}>/{userPreferences.goals.water / 1000}L</Text>
        </View>
      </View>

      {/* Today's Workout Card (Hero) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Treino de Hoje</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('calendar')}>
          <Text style={styles.linkText}>Ver calendário</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => handleWorkoutClick(workoutsData[0])}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: workoutsData[0].image }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(2, 6, 23, 0.4)', '#020617']}
          style={styles.heroGradient}
        />

        <View style={styles.heroContent}>
          <View style={styles.tagsRow}>
            <BlurView intensity={20} style={styles.tagBlur}>
              <Text style={styles.tagTextLime}>{workoutsData[0].level}</Text>
            </BlurView>
            <BlurView intensity={20} style={styles.tagBlur}>
              <Text style={styles.tagTextWhite}>{workoutsData[0].duration}</Text>
            </BlurView>
          </View>
          <Text style={styles.heroTitle}>{workoutsData[0].title}</Text>
          <Text style={styles.heroSubtitle}>{workoutsData[0].subtitle}</Text>

          <TouchableOpacity style={styles.startButton} onPress={() => handleWorkoutClick(workoutsData[0])}>
            <Play size={18} color={colors.slate950} fill={colors.slate900} />
            <Text style={styles.startButtonText}>Começar Agora</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* New Section: Your Routine */}
      <View style={styles.horizontalSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sua Rotina</Text>
          <ArrowRight size={18} color={colors.slate500} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {workoutsData.slice(1).map((workout) => (
            <TouchableOpacity
              key={workout.id}
              onPress={() => handleWorkoutClick(workout)}
              style={styles.routineCard}
              activeOpacity={0.8}
            >
              <View style={styles.routineImageContainer}>
                <Image source={{ uri: workout.image }} style={styles.routineImage} />
                <View style={styles.routineImageOverlay} />
              </View>
              <Text style={styles.routineTitle} numberOfLines={1}>{workout.title}</Text>
              <Text style={styles.routineSubtitle} numberOfLines={1}>{workout.subtitle}</Text>
              <View style={styles.routineMeta}>
                <Clock size={10} color={colors.lime400} />
                <Text style={styles.routineDuration}>{workout.duration}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ width: 24 }} />
        </ScrollView>
      </View>
    </ScrollView>
  );

  const WorkoutsScreen = () => (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 20 }}>
      <Text style={styles.screenTitle}>Treinos</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {workoutsData.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            onPress={() => handleWorkoutClick(workout)}
            style={[styles.heroCard, { height: 200, marginBottom: 20 }]}
          >
            <Image source={{ uri: workout.image }} style={styles.heroImage} />
            <LinearGradient colors={['transparent', '#020617']} style={styles.heroGradient} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{workout.title}</Text>
              <Text style={styles.heroSubtitle}>{workout.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const StatsScreen = () => {
    const [filter, setFilter] = useState('weekly'); // 'weekly', 'monthly', 'all'

    // Mock Data for Graphs (in real app, aggregate from workoutHistory/dailyStats)
    const weightData = {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
      datasets: [{ data: [78, 77, 76.5, 75, 74.2, 73] }]
    };

    const caloriesData = {
      labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"],
      datasets: [{ data: [2100, 2300, 1950, 2200, 2400, 1800, 2000] }]
    };

    const screenWidth = Dimensions.get("window").width;

    const chartConfig = {
      backgroundGradientFrom: "#1e293b",
      backgroundGradientFromOpacity: 0.5,
      backgroundGradientTo: "#0f172a",
      backgroundGradientToOpacity: 0.8,
      color: (opacity = 1) => `rgba(163, 230, 53, ${opacity})`, // Lime-400
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false,
      decimalPlaces: 0,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };

    return (
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={styles.screenTitle}>Estatísticas</Text>
          {/* Filter Pills */}
          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.slate800, padding: 4, borderRadius: 12 }}>
            <TouchableOpacity
              onPress={() => setFilter('weekly')}
              style={{ px: 12, py: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: filter === 'weekly' ? colors.slate700 : 'transparent' }}
            >
              <Text style={{ color: filter === 'weekly' ? colors.white : colors.slate500, fontSize: 12, fontWeight: 'bold' }}>Semana</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('monthly')}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: filter === 'monthly' ? colors.slate700 : 'transparent' }}
            >
              <Text style={{ color: filter === 'monthly' ? colors.white : colors.slate500, fontSize: 12, fontWeight: 'bold' }}>Mês</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Summary Cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <View style={[styles.statsCard, { height: 100, padding: 12 }]}>
              <Text style={[styles.statsLabel, { fontSize: 10 }]}>TREINOS REALIZADOS</Text>
              <Text style={[styles.statsValue, { fontSize: 32 }]}>12</Text>
              <Text style={[styles.statsSubtext, { fontSize: 10 }]}>+2 essa semana</Text>
            </View>
            <View style={[styles.statsCard, { height: 100, padding: 12, borderColor: colors.blue500 }]}>
              <Text style={[styles.statsLabel, { fontSize: 10, color: colors.blue400 }]}>EVOLUÇÃO PESO</Text>
              <Text style={[styles.statsValue, { fontSize: 32 }]}>-5kg</Text>
              <Text style={[styles.statsSubtext, { fontSize: 10 }]}>Últimos 6 meses</Text>
            </View>
          </View>

          {/* Weight Graph */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.white, fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Evolução de Peso</Text>
            <LineChart
              data={weightData}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`, // Blue
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </View>

          {/* Calories Graph */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.white, fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Consumo Calórico Diário</Text>
            <BarChart
              data={caloriesData}
              width={screenWidth - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix="k"
              chartConfig={chartConfig}
              style={{ borderRadius: 16 }}
              verticalLabelRotation={0}
            />
          </View>

          {/* Macro Distribution Ring (Simplified visualization) */}
          <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 20, borderRadius: 24, marginBottom: 20 }}>
            <Text style={{ color: colors.white, fontWeight: 'bold', marginBottom: 16 }}>Distribuição de Macros (Média)</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.red500, marginBottom: 8 }} />
                <Text style={{ color: colors.slate400, fontSize: 12 }}>Proteína</Text>
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>30%</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.lime400, marginBottom: 8 }} />
                <Text style={{ color: colors.slate400, fontSize: 12 }}>Carbs</Text>
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>45%</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.orange400, marginBottom: 8 }} />
                <Text style={{ color: colors.slate400, fontSize: 12 }}>Gordura</Text>
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>25%</Text>
              </View>
            </View>
            {/* Visual Bar */}
            <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 16 }}>
              <View style={{ flex: 0.3, backgroundColor: colors.red500 }} />
              <View style={{ flex: 0.45, backgroundColor: colors.lime400 }} />
              <View style={{ flex: 0.25, backgroundColor: colors.orange400 }} />
            </View>
          </View>

        </ScrollView>
      </View>
    );
  };

  const SettingsScreen = () => {
    const [localGoals, setLocalGoals] = useState(userPreferences.goals);
    const [localSchedule, setLocalSchedule] = useState(userPreferences.schedule);

    // Days of week map
    const days = [
      { id: 'monday', label: 'Segunda-feira' },
      { id: 'tuesday', label: 'Terça-feira' },
      { id: 'wednesday', label: 'Quarta-feira' },
      { id: 'thursday', label: 'Quinta-feira' },
      { id: 'friday', label: 'Sexta-feira' },
      { id: 'saturday', label: 'Sábado' },
      { id: 'sunday', label: 'Domingo' }
    ];

    // Workouts themes options
    const workoutOptions = [
      { label: 'Descanso', value: 'rest' },
      { label: 'Peito & Tríceps', value: 'chest-triceps' },
      { label: 'Costas & Bíceps', value: 'back-biceps' },
      { label: 'Pernas', value: 'legs' },
      { label: 'Ombros & Abdômen', value: 'shoulders-abs' },
      { label: 'Flow (Full Body)', value: 'flow' },
    ];

    const handleSave = async () => {
      await updatePreferences({ goals: localGoals, schedule: localSchedule });
      handleTabPress('profile'); // Go back
    };

    return (
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => handleTabPress('profile')}>
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.white, marginLeft: 16 }}>Configurações</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Goals Section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.lime400, fontWeight: 'bold', fontSize: 14, marginBottom: 16, textTransform: 'uppercase' }}>Metas Diárias</Text>

            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: colors.slate800, padding: 16, borderRadius: 16 }}>
                <Text style={{ color: colors.slate400, fontSize: 12, marginBottom: 8 }}>CALORIAS (Kcal)</Text>
                <TextInput
                  keyboardType='numeric'
                  value={localGoals.kcal.toString()}
                  onChangeText={t => setLocalGoals({ ...localGoals, kcal: parseInt(t) || 0 })}
                  style={{ color: colors.white, fontSize: 20, fontWeight: 'bold' }}
                />
              </View>
              <View style={{ flex: 1, backgroundColor: colors.slate800, padding: 16, borderRadius: 16 }}>
                <Text style={{ color: colors.slate400, fontSize: 12, marginBottom: 8 }}>PESO ALVO (Kg)</Text>
                <TextInput
                  keyboardType='numeric'
                  value={localGoals.weight.toString()}
                  onChangeText={t => setLocalGoals({ ...localGoals, weight: parseInt(t) || 0 })}
                  style={{ color: colors.white, fontSize: 20, fontWeight: 'bold' }}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1, backgroundColor: colors.slate800, padding: 16, borderRadius: 16 }}>
                <Text style={{ color: colors.slate400, fontSize: 12, marginBottom: 8 }}>PROTEÍNA (g)</Text>
                <TextInput
                  keyboardType='numeric'
                  value={localGoals.protein.toString()}
                  onChangeText={t => setLocalGoals({ ...localGoals, protein: parseInt(t) || 0 })}
                  style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}
                />
              </View>
              <View style={{ flex: 1, backgroundColor: colors.slate800, padding: 16, borderRadius: 16 }}>
                <Text style={{ color: colors.slate400, fontSize: 12, marginBottom: 8 }}>CARBO (g)</Text>
                <TextInput
                  keyboardType='numeric'
                  value={localGoals.carbs.toString()}
                  onChangeText={t => setLocalGoals({ ...localGoals, carbs: parseInt(t) || 0 })}
                  style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}
                />
              </View>
              <View style={{ flex: 1, backgroundColor: colors.slate800, padding: 16, borderRadius: 16 }}>
                <Text style={{ color: colors.slate400, fontSize: 12, marginBottom: 8 }}>ÁGUA (ml)</Text>
                <TextInput
                  keyboardType='numeric'
                  value={localGoals.water.toString()}
                  onChangeText={t => setLocalGoals({ ...localGoals, water: parseInt(t) || 0 })}
                  style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}
                />
              </View>
            </View>
          </View>

          {/* Schedule Section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.lime400, fontWeight: 'bold', fontSize: 14, marginBottom: 16, textTransform: 'uppercase' }}>Cronograma Semanal</Text>

            {days.map((day) => {
              const currentVal = localSchedule[day.id as keyof typeof localSchedule];
              const currentLabel = workoutOptions.find(o => o.value === currentVal)?.label || 'Descanso';

              return (
                <View key={day.id} style={{ marginBottom: 12 }}>
                  <Text style={{ color: colors.slate400, fontSize: 12, marginBottom: 4 }}>{day.label}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {workoutOptions.map(opt => (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setLocalSchedule({ ...localSchedule, [day.id]: opt.value })}
                          style={{
                            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                            backgroundColor: currentVal === opt.value ? colors.lime500 : colors.slate800,
                            borderWidth: 1, borderColor: currentVal === opt.value ? colors.lime400 : colors.slate700
                          }}
                        >
                          <Text style={{
                            color: currentVal === opt.value ? colors.slate950 : colors.slate300,
                            fontWeight: '600', fontSize: 12
                          }}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={{ backgroundColor: colors.lime400, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: colors.slate900, fontWeight: 'bold', fontSize: 16 }}>Salvar Configurações</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const ProfileScreen = () => (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 20 }}>
      {/* ... keeping ProfileScreen as is mostly ... */}
      <Text style={[styles.screenTitle, { marginBottom: 30 }]}>Perfil</Text>

      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.slate800, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lime400, marginBottom: 16, overflow: 'hidden' }}>
          {currentUser?.avatar_uri ? (
            <Image source={{ uri: currentUser.avatar_uri }} style={{ width: 100, height: 100 }} />
          ) : (
            <User size={40} color={colors.lime400} />
          )}
        </View>
        <Text style={styles.userNameText}>{userName}</Text>
        <Text style={{ color: colors.slate400 }}>Membro Pro</Text>
        {/* Live Goal Display */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.white, fontWeight: 'bold' }}>{userPreferences.goals.weight}kg</Text>
            <Text style={{ color: colors.slate500, fontSize: 10 }}>Meta</Text>
          </View>
          <View style={{ width: 1, height: 24, backgroundColor: colors.slate700 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.white, fontWeight: 'bold' }}>{userPreferences.goals.kcal}</Text>
            <Text style={{ color: colors.slate500, fontSize: 10 }}>Kcal</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => setCurrentScreen('settings')}>
        <Settings size={20} color={colors.white} />
        <Text style={styles.menuItemText}>Configurações</Text>
        <ArrowRight size={16} color={colors.slate600} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {/* ... history and logout ... */}
      <TouchableOpacity style={styles.menuItem}>
        <Activity size={20} color={colors.white} />
        <Text style={styles.menuItemText}>Histórico</Text>
        <ArrowRight size={16} color={colors.slate600} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, { marginTop: 40, borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
        onPress={handleLogout}
      >
        <LogOut size={20} color={colors.red500} />
        <Text style={[styles.menuItemText, { color: colors.red500 }]}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );

  const DetailsScreen = () => (
    <View style={styles.detailsContainer}>
      {/* Top Image Hero */}
      <View style={styles.detailsHero}>
        <Image
          source={{ uri: activeWorkout.image }}
          style={styles.detailsHeroImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', colors.slate950]}
          style={styles.detailsGradient}
        />

        {/* Navbar absolute */}
        <View style={[styles.detailsNav, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => setCurrentScreen('home')}
            style={styles.detailsNavButton}
          >
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsNavButton}>
            <MoreHorizontal size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Floating Stats */}
        <View style={styles.floatingStatsContainer}>
          <BlurView intensity={30} tint="dark" style={styles.floatingStat}>
            <Text style={styles.floatingStatValueLime}>{activeWorkout.duration}</Text>
            <Text style={styles.floatingStatLabel}>DURAÇÃO</Text>
          </BlurView>
          <BlurView intensity={30} tint="dark" style={styles.floatingStat}>
            <Text style={styles.floatingStatValueOrange}>{activeWorkout.calories}</Text>
            <Text style={styles.floatingStatLabel}>QUEIMA</Text>
          </BlurView>
          <BlurView intensity={30} tint="dark" style={styles.floatingStat}>
            <Text style={styles.floatingStatValueBlue}>{activeWorkout.exercises.length}</Text>
            <Text style={styles.floatingStatLabel}>SÉRIES</Text>
          </BlurView>
        </View>
      </View>

      {/* Content Sheet */}
      <View style={styles.contentSheet}>
        {/* Pull Indicator */}
        <View style={styles.pullIndicator} />

        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>{activeWorkout.title}</Text>
            <View style={styles.sheetMetaRow}>
              <Calendar size={14} color={colors.slate400} />
              <Text style={styles.sheetMetaText}>Hoje</Text>
              <View style={styles.dot} />
              <Text style={styles.sheetMetaLevel}>{activeWorkout.level}</Text>
            </View>
          </View>
        </View>

        {/* Exercises List */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.exercisesTitle}>EXERCÍCIOS ({activeWorkout.exercises.length})</Text>

          {activeWorkout.exercises.map((exercise, index) => (
            <TouchableOpacity key={exercise.id} style={styles.exerciseCard}>
              {/* Image Placeholder */}
              <View style={styles.exerciseImageContainer}>
                <Image
                  source={{ uri: `https://images.unsplash.com/photo-${index % 2 === 0 ? '1534438327276-14e5300c3a48' : '1583454110551-21f2fa2afe61'}?auto=format&fit=crop&w=100&h=100` }}
                  style={styles.exerciseImage}
                />
                <View style={styles.exerciseOverlay} />
                {exercise.completed && (
                  <View style={styles.completedOverlay}>
                    <CheckCircle2 size={24} color={colors.white} />
                  </View>
                )}
              </View>

              <View style={styles.exerciseInfo}>
                <Text style={[
                  styles.exerciseName,
                  exercise.completed && styles.completedText
                ]}>
                  {exercise.name}
                </Text>
                <View style={styles.exerciseStats}>
                  <View style={styles.exerciseTag}>
                    <Text style={styles.exerciseTagText}>{exercise.sets}</Text>
                  </View>
                  <Text style={styles.exerciseReps}>{exercise.reps}</Text>
                </View>
              </View>

              <View style={styles.playButtonSmall}>
                <Play size={14} color={colors.slate400} fill={colors.slate400} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sticky CTA */}
        <View style={[styles.stickyCTA, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity style={styles.mainButton}>
            <Play size={20} color={colors.slate900} fill={colors.slate900} />
            <Text style={styles.mainButtonText}>INICIAR TREINO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [logWorkoutId, setLogWorkoutId] = useState('chest-triceps'); // Default
  const [logExercises, setLogExercises] = useState<any[]>([]);

  // Initialize exercises when workout type changes in modal
  useEffect(() => {
    const template = workoutsData.find(w => w.id === logWorkoutId);
    if (template) {
      setLogExercises(template.exercises.map(e => ({
        ...e,
        weight: 0, // ensure weight field exists
        actualSets: 0,
        actualReps: 0
      })));
    }
  }, [logWorkoutId]);

  const handleFinishWorkout = async () => {
    const template = workoutsData.find(w => w.id === logWorkoutId);
    if (!template) return;

    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      workoutId: logWorkoutId,
      workoutTitle: template.title,
      duration: parseInt(template.duration) || 60,
      calories: parseInt(template.calories) || 400,
      exercises: logExercises.map(e => ({
        id: e.id,
        name: e.name,
        sets: e.actualSets || 3, // Default if not filled
        reps: e.actualReps || '12',
        weight: e.weight || 0,
        completed: true
      }))
    };

    await addWorkoutSession(session);

    // Update daily stats for calories (naive addition)
    // @ts-ignore
    if (updatePreferences) {
      // Actually we need updateDailyStats
      // But wait, updateDailyStats is available
    }
    // We should update daily stats calories?
    // Let's assume the daily stats calorie is CONSUMED (Food). Burned is different.
    // Usually apps track CONSUMED vs BURNED. 
    // The dashboard 'Kcal' usually means Consumed / Goal Consumed.
    // Burned is usually separate. 
    // For now let's just save the session.

    setShowWorkoutModal(false);
    setCurrentScreen('home'); // Go home to see it? Or History?
  };


  const WorkoutLogModal = () => (
    <Modal
      visible={showWorkoutModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowWorkoutModal(false)}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: colors.slate950, marginTop: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' }}>
          <View style={{ padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.slate900 }}>
            <Text style={{ color: colors.white, fontSize: 20, fontWeight: 'bold' }}>Registrar Treino</Text>
            <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
              <X size={24} color={colors.slate400} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            {/* Date - For now assume Today */}
            <Text style={{ color: colors.slate400, marginBottom: 8 }}>Data: <Text style={{ color: colors.white }}>Hoje</Text></Text>

            {/* Workout Selector */}
            <Text style={{ color: colors.lime400, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' }}>Treino Realizado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {workoutsData.filter(w => w.id !== 'flow').map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setLogWorkoutId(opt.id)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
                      backgroundColor: logWorkoutId === opt.id ? colors.lime500 : colors.slate800,
                      borderWidth: 1, borderColor: logWorkoutId === opt.id ? colors.lime400 : colors.slate700
                    }}
                  >
                    <Text style={{
                      color: logWorkoutId === opt.id ? colors.slate950 : colors.slate300,
                      fontWeight: 'bold'
                    }}>
                      {opt.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Exercises */}
            <Text style={{ color: colors.lime400, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' }}>Exercícios & Cargas</Text>

            {logExercises.map((ex, idx) => (
              <View key={ex.id} style={{ marginBottom: 16, backgroundColor: colors.slate800, padding: 16, borderRadius: 16 }}>
                <Text style={{ color: colors.white, fontWeight: 'bold', marginBottom: 12 }}>{ex.name}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.slate500, fontSize: 10, marginBottom: 4 }}>SÉRIES</Text>
                    <TextInput
                      keyboardType='numeric'
                      placeholderTextColor={colors.slate600}
                      placeholder={ex.sets.toString().split(' ')[0]} // extract "4" from "4 series"
                      style={{ backgroundColor: colors.slate900, color: colors.white, padding: 12, borderRadius: 8 }}
                      onChangeText={t => {
                        const newExs = [...logExercises];
                        newExs[idx].actualSets = parseInt(t);
                        setLogExercises(newExs);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.slate500, fontSize: 10, marginBottom: 4 }}>REPS</Text>
                    <TextInput
                      keyboardType='numeric'
                      placeholderTextColor={colors.slate600}
                      placeholder="12"
                      style={{ backgroundColor: colors.slate900, color: colors.white, padding: 12, borderRadius: 8 }}
                      onChangeText={t => {
                        const newExs = [...logExercises];
                        newExs[idx].actualReps = t;
                        setLogExercises(newExs);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.slate500, fontSize: 10, marginBottom: 4 }}>KG</Text>
                    <TextInput
                      keyboardType='numeric'
                      placeholderTextColor={colors.slate600}
                      placeholder="0"
                      style={{ backgroundColor: colors.slate900, color: colors.white, padding: 12, borderRadius: 8 }}
                      onChangeText={t => {
                        const newExs = [...logExercises];
                        newExs[idx].weight = parseInt(t);
                        setLogExercises(newExs);
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleFinishWorkout}
              style={{
                backgroundColor: colors.lime400, paddingVertical: 16, borderRadius: 16,
                alignItems: 'center', marginTop: 16, marginBottom: 50,
                flexDirection: 'row', justifyContent: 'center', gap: 8
              }}
            >
              <Check size={20} color={colors.slate950} />
              <Text style={{ color: colors.slate950, fontWeight: 'bold', fontSize: 16 }}>Finalizar Treino</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  // --- Bottom Nav Component ---

  const BottomNav = () => (
    <BlurView intensity={95} tint="dark" style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 20), backgroundColor: 'rgba(2, 6, 23, 0.6)' }]}>
      <View style={styles.bottomNavContent}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('home')}>
          <Home size={24} color={activeTab === 'home' ? colors.lime400 : colors.slate400} />
          <Text style={[styles.navText, activeTab === 'home' && { color: colors.lime400 }]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('workouts')}>
          <Activity size={24} color={activeTab === 'workouts' ? colors.lime400 : colors.slate400} />
          <Text style={[styles.navText, activeTab === 'workouts' && { color: colors.lime400 }]}>Treinos</Text>
        </TouchableOpacity>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setShowWorkoutModal(true)}>
            <Dumbbell size={28} color={colors.slate900} fill={colors.slate900} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('stats')}>
          <BarChart2 size={24} color={activeTab === 'stats' ? colors.lime400 : colors.slate400} />
          <Text style={[styles.navText, activeTab === 'stats' && { color: colors.lime400 }]}>Estatísticas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('nutrition')}>
          <Utensils size={24} color={activeTab === 'nutrition' ? colors.lime400 : colors.slate400} />
          <Text style={[styles.navText, activeTab === 'nutrition' && { color: colors.lime400 }]}>Dieta</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  return (
    <View style={styles.mainContainer}>
      <RNStatusBar barStyle="light-content" backgroundColor={colors.slate950} />

      {/* Background Ambient Glows */}
      {/* Background Ambient Glows - Replaced with SVG for better diffusion */}
      <View style={styles.glowContainer} pointerEvents="none">
        {/* Top Left Green Glow */}
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient
              id="grad1"
              cx="0%"
              cy="0%"
              rx="50%"
              ry="50%"
              fx="0%"
              fy="0%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor="#84cc16" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient
              id="grad2"
              cx="100%"
              cy="100%"
              rx="50%"
              ry="50%"
              fx="100%"
              fy="100%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
        </Svg>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentLayer}>
        {(!currentUser || currentScreen === 'login') ? (
          <LoginScreen />
        ) : currentScreen === 'details' ? (
          <DetailsScreen />
        ) : currentScreen === 'settings' ? (
          <SettingsScreen />
        ) : currentScreen === 'calendar' ? (
          <CalendarScreen />
        ) : (
          <>
            {currentScreen === 'home' && <HomeScreen />}
            {currentScreen === 'workouts' && <WorkoutsScreen />}
            {currentScreen === 'stats' && <StatsScreen />}
            {currentScreen === 'stats' && <StatsScreen />}
            {currentScreen === 'nutrition' && <NutritionScreen />}
            {currentScreen === 'profile' && <ProfileScreen />}

            <BottomNav />
            <WorkoutLogModal />
          </>
        )}
      </View>
    </View>
  );
};

// --- NUTRITION SCREEN (Restored) ---
const NutritionScreen = () => {
  const { dailyStats, updateDailyStats } = useUser();

  const addWater = (amount: number) => {
    updateDailyStats({ waterConsumed: (dailyStats?.waterConsumed || 0) + amount });
  };

  const waterConsumed = dailyStats?.waterConsumed || 0;

  const renderFoodSection = (title: string, icon: any, color: string, calories: number) => (
    <View style={{ marginBottom: 24 }} key={title}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>{title}</Text>
        </View>
        <TouchableOpacity>
          <PlusCircle size={20} color={colors.lime400} />
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.slate700 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.slate300, fontSize: 14 }}>Adicionar alimento...</Text>
          <Text style={{ color: colors.slate500, fontSize: 14 }}>0 kcal</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 20 }}>
      <Text style={styles.screenTitle}>Dieta & Hidratação</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Water Tracker Card */}
        <View style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)',
          borderRadius: 24, padding: 20, marginBottom: 32, overflow: 'hidden'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Droplet size={24} color={colors.blue400} fill={colors.blue400} />
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>Hidratação</Text>
            </View>
            <Text style={{ color: colors.blue400, fontWeight: 'bold', fontSize: 18 }}>
              {waterConsumed} <Text style={{ color: colors.slate400, fontSize: 14 }}>/ {userPreferences.goals.water} ml</Text>
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={{ height: 12, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 6, marginBottom: 20, overflow: 'hidden' }}>
            <View style={{
              width: `${Math.min((waterConsumed / userPreferences.goals.water) * 100, 100)}%`,
              height: '100%', backgroundColor: colors.blue400, borderRadius: 6
            }} />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => addWater(250)}
              style={{ flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={16} color={colors.blue400} />
              <Text style={{ color: colors.blue400, fontWeight: 'bold' }}>250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => addWater(500)}
              style={{ flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={16} color={colors.blue400} />
              <Text style={{ color: colors.blue400, fontWeight: 'bold' }}>500ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Food Sections */}
        {renderFoodSection('Café da Manhã', <Apple size={18} color={colors.orange400} />, colors.orange400, 450)}
        {renderFoodSection('Almoço', <Utensils size={18} color={colors.lime400} />, colors.lime400, 600)}
        {renderFoodSection('Lanche', <Apple size={18} color={colors.lime400} />, colors.lime400, 200)}
        {renderFoodSection('Jantar', <Utensils size={18} color={colors.blue400} />, colors.blue400, 450)}

      </ScrollView>
    </View>
  );
};
mainContainer: {
  flex: 1,
    backgroundColor: colors.slate950,
  },
glowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
      zIndex: 0,
  },
contentLayer: {
  flex: 1,
    zIndex: 10,
  },
screenContainer: {
  flex: 1,
    paddingHorizontal: 24,
  },
screenTitle: {
  fontSize: 28,
    fontWeight: 'bold',
      color: colors.white,
        marginBottom: 20,
  },
header: {
  flexDirection: 'row',
    justifyContent: 'space-between',
      alignItems: 'center',
        marginBottom: 32,
  },
welcomeText: {
  color: colors.slate400,
    fontSize: 14,
      fontWeight: '500',
        marginBottom: 4,
  },
userNameText: {
  fontSize: 30,
    fontWeight: 'bold',
      color: colors.white,
        letterSpacing: -0.5,
  },
avatarContainer: {
  padding: 2,
    borderRadius: 50,
      borderWidth: 1,
        borderColor: colors.slate700,
          backgroundColor: colors.slate800,
            width: 44,
              height: 44,
                alignItems: 'center',
                  justifyContent: 'center',
                    overflow: 'hidden',
  },
avatar: {
  width: 40,
    height: 40,
      borderRadius: 20,
  },
statsGrid: {
  flexDirection: 'row',
    gap: 16,
      marginBottom: 32,
  },
statsCard: {
  flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
      padding: 16,
        borderRadius: 24,
          borderWidth: 1,
            borderColor: colors.slate700,
              height: 128,
                justifyContent: 'space-between',
                  overflow: 'hidden',
  },
glow: {
  position: 'absolute',
    right: -16,
      top: -16,
        width: 96,
          height: 96,
            borderRadius: 48,
  },
statsHeader: {
  flexDirection: 'row',
    alignItems: 'center',
      gap: 8,
        marginBottom: 8,
  },
statsLabel: {
  fontSize: 12,
    fontWeight: 'bold',
      textTransform: 'uppercase',
        letterSpacing: 1,
  },
statsValue: {
  fontSize: 24,
    fontWeight: 'bold',
      color: colors.white,
  },
statsSubtext: {
  fontSize: 12,
    color: colors.slate400,
  },
sectionHeader: {
  flexDirection: 'row',
    justifyContent: 'space-between',
      alignItems: 'flex-end',
        marginBottom: 16,
  },
sectionTitle: {
  fontSize: 20,
    fontWeight: 'bold',
      color: colors.white,
  },
linkText: {
  color: colors.lime400,
    fontSize: 14,
      fontWeight: '500',
  },
heroCard: {
  height: 256,
    borderRadius: 32,
      overflow: 'hidden',
        marginBottom: 32,
          backgroundColor: colors.slate800,
            // shadowing in RN
            shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.5,
    shadowRadius: 20,
      elevation: 10,
  },
heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
      height: '100%',
  },
heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
heroContent: {
  position: 'absolute',
    bottom: 0,
      left: 0,
        right: 0,
          padding: 24,
  },
tagsRow: {
  flexDirection: 'row',
    gap: 8,
      marginBottom: 12,
  },
tagBlur: {
  overflow: 'hidden',
    borderRadius: 100,
      borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
  },
tagTextLime: {
  paddingHorizontal: 12,
    paddingVertical: 4,
      color: colors.lime400,
        fontSize: 12,
          fontWeight: '500',
            backgroundColor: 'rgba(163, 230, 53, 0.2)',
  },
tagTextWhite: {
  paddingHorizontal: 12,
    paddingVertical: 4,
      color: colors.white,
        fontSize: 12,
          fontWeight: '500',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
heroTitle: {
  fontSize: 24,
    fontWeight: 'bold',
      color: colors.white,
        marginBottom: 4,
  },
heroSubtitle: {
  fontSize: 14,
    color: colors.slate300,
      marginBottom: 16,
  },
startButton: {
  backgroundColor: colors.lime400,
    paddingVertical: 14,
      borderRadius: 16,
        flexDirection: 'row',
          justifyContent: 'center',
            alignItems: 'center',
              gap: 8,
  },
startButtonText: {
  color: colors.slate950,
    fontWeight: 'bold',
      fontSize: 16,
  },
// Horizontal Section
horizontalSection: {
  marginBottom: 16,
  },
horizontalScroll: {
  paddingRight: 24,
    marginHorizontal: -24, // Break out of parent padding
      paddingHorizontal: 24,
  },
routineCard: {
  width: 160,
    padding: 12,
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderWidth: 1,
          borderColor: colors.slate700,
            borderRadius: 16,
              marginRight: 16,
  },
routineImageContainer: {
  height: 112,
    borderRadius: 12,
      overflow: 'hidden',
        marginBottom: 12,
          backgroundColor: colors.slate800,
  },
routineImage: {
  width: '100%',
    height: '100%',
  },
routineImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
routineTitle: {
  color: colors.white,
    fontSize: 14,
      fontWeight: 'bold',
        marginBottom: 4,
  },
routineSubtitle: {
  color: colors.slate400,
    fontSize: 12,
      marginBottom: 8,
  },
routineMeta: {
  flexDirection: 'row',
    alignItems: 'center',
  },
routineDuration: {
  color: colors.lime400,
    fontSize: 10,
      fontWeight: 'bold',
        marginLeft: 4,
  },
// Bottom Nav
bottomNav: {
  position: 'absolute',
    bottom: 0,
      left: 0,
        right: 0,
          borderTopWidth: 1,
            borderTopColor: colors.slate800,
              paddingHorizontal: 16,
                paddingTop: 16,
  },
bottomNavContent: {
  flexDirection: 'row',
    justifyContent: 'space-between',
      alignItems: 'center',
  },
navItem: {
  alignItems: 'center',
    gap: 4,
      flex: 1,
  },
navText: {
  fontSize: 10,
    fontWeight: '500',
      color: colors.slate400,
  },
fabContainer: {
  position: 'relative',
    top: -24,
      flex: 1,
        alignItems: 'center',
  },
fab: {
  backgroundColor: colors.lime400,
    padding: 16,
      borderRadius: 50,
        shadowColor: colors.lime400,
          shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
    shadowRadius: 12,
      elevation: 8,
  },
// Details Screen
detailsContainer: {
  flex: 1,
    backgroundColor: colors.slate950,
  },
detailsHero: {
  height: '45%',
    width: '100%',
      position: 'relative',
  },
detailsHeroImage: {
  width: '100%',
    height: '100%',
  },
detailsGradient: {
    ...StyleSheet.absoluteFillObject,
  },
detailsNav: {
  position: 'absolute',
    top: 0,
      left: 0,
        right: 0,
          flexDirection: 'row',
            justifyContent: 'space-between',
              paddingHorizontal: 24,
                paddingBottom: 24,
  },
detailsNavButton: {
  width: 40,
    height: 40,
      borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
          justifyContent: 'center',
            alignItems: 'center',
              borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
  },
floatingStatsContainer: {
  position: 'absolute',
    bottom: 48,
      left: 24,
        right: 24,
          flexDirection: 'row',
            justifyContent: 'space-between',
  },
floatingStat: {
  padding: 12,
    borderRadius: 16,
      overflow: 'hidden',
        minWidth: 80,
          alignItems: 'center',
            borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
floatingStatValueLime: {
  color: colors.lime400,
    fontWeight: 'bold',
      fontSize: 18,
  },
floatingStatValueOrange: {
  color: colors.orange400,
    fontWeight: 'bold',
      fontSize: 18,
  },
floatingStatValueBlue: {
  color: colors.blue400,
    fontWeight: 'bold',
      fontSize: 18,
  },
floatingStatLabel: {
  color: colors.slate300,
    fontSize: 10,
      fontWeight: 'bold',
        marginTop: 2,
  },
contentSheet: {
  flex: 1,
    marginTop: -32,
      backgroundColor: colors.slate900,
        borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
            paddingHorizontal: 24,
              paddingTop: 40,
                borderTopWidth: 1,
                  borderTopColor: colors.slate800,
  },
pullIndicator: {
  position: 'absolute',
    top: 16,
      left: '50%',
        marginLeft: -24,
          width: 48,
            height: 6,
              backgroundColor: colors.slate700,
                borderRadius: 3,
  },
sheetHeader: {
  marginBottom: 24,
  },
sheetTitle: {
  fontSize: 24,
    fontWeight: 'bold',
      color: colors.white,
        marginBottom: 4,
  },
sheetMetaRow: {
  flexDirection: 'row',
    alignItems: 'center',
      gap: 8,
  },
sheetMetaText: {
  color: colors.slate400,
    fontSize: 14,
  },
dot: {
  width: 4,
    height: 4,
      borderRadius: 2,
        backgroundColor: colors.slate600,
  },
sheetMetaLevel: {
  color: colors.lime400,
    fontSize: 14,
      fontWeight: '500',
  },
exercisesTitle: {
  fontSize: 14,
    fontWeight: '600',
      color: colors.slate500,
        marginBottom: 16,
          letterSpacing: 1,
  },
exerciseCard: {
  flexDirection: 'row',
    alignItems: 'center',
      backgroundColor: colors.slate800,
        padding: 16,
          borderRadius: 16,
            marginBottom: 16,
              gap: 16,
  },
exerciseImageContainer: {
  width: 64,
    height: 64,
      borderRadius: 12,
        overflow: 'hidden',
          backgroundColor: colors.slate700,
  },
exerciseImage: {
  width: '100%',
    height: '100%',
      opacity: 0.8,
  },
exerciseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(132, 204, 22, 0.8)',
      justifyContent: 'center',
        alignItems: 'center',
  },
exerciseInfo: {
  flex: 1,
  },
exerciseName: {
  color: colors.white,
    fontWeight: '600',
      fontSize: 16,
        marginBottom: 4,
  },
completedText: {
  color: colors.slate500,
    textDecorationLine: 'line-through',
  },
exerciseStats: {
  flexDirection: 'row',
    alignItems: 'center',
      gap: 12,
  },
exerciseTag: {
  backgroundColor: colors.slate700,
    paddingHorizontal: 8,
      paddingVertical: 2,
        borderRadius: 6,
  },
exerciseTagText: {
  color: colors.slate300,
    fontSize: 12,
  },
exerciseReps: {
  color: colors.slate400,
    fontSize: 12,
  },
playButtonSmall: {
  width: 32,
    height: 32,
      borderRadius: 16,
        borderWidth: 1,
          borderColor: colors.slate600,
            justifyContent: 'center',
              alignItems: 'center',
  },
stickyCTA: {
  position: 'absolute',
    bottom: 0,
      left: 24,
        right: 24,
          paddingTop: 16, // spacing from content
            backgroundColor: colors.slate900, // Background to cover scroll content
  },
mainButton: {
  backgroundColor: colors.lime400,
    height: 56,
      borderRadius: 20,
        flexDirection: 'row',
          alignItems: 'center',
            justifyContent: 'center',
              gap: 12,
                shadowColor: colors.lime400,
                  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
    shadowRadius: 10,
      elevation: 5,
  },
mainButtonText: {
  color: colors.slate900,
    fontSize: 16,
      fontWeight: 'bold',
        letterSpacing: 0.5,
  },
// Menu Item
menuItem: {
  flexDirection: 'row',
    alignItems: 'center',
      padding: 16,
        borderRadius: 16,
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
            borderWidth: 1,
              borderColor: colors.slate700,
                marginBottom: 12,
                  gap: 16,
  },
menuItemText: {
  color: colors.white,
    fontSize: 16,
      fontWeight: '500',
  }
});

export default GlassFitnessApp;
