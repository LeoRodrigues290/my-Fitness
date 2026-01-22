# my-Fitness 🏋️‍♂️

> Seu companheiro pessoal de fitness para acompanhar treinos, nutrição e progresso.

<div align="center">
  <img src="./assets/icon.png" alt="Ícone do App" width="120" />
</div>

<br />

<div align="center">

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

</div>

## 📱 Sobre o App

**my-Fitness** é um aplicativo móvel robusto construído com **React Native** e **Expo**, projetado para manter você no controle de seus objetivos de fitness.

Principais funcionalidades:
- 📊 **Acompanhamento de Progresso:** Visualize sua jornada com gráficos e estatísticas intuitivas.
- 🥗 **Registro de Nutrição:** Mantenha o controle de suas calorias e macros diários.
- 📅 **Gerenciamento de Treinos:** Registre exercícios, séries e repetições de forma simples.
- 💾 **Armazenamento Local:** Seus dados estão seguros e funcionam offline com integração SQLite.
- 🎨 **Interface Fluida:** Interface amigável impulsionada por Reanimated para interações suaves.

---

## 🚀 Começando

Siga estes passos para configurar o projeto localmente em sua máquina.

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.
- [Expo CLI](https://docs.expo.dev/get-started/installation/) instalada.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd my-fitness
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Rode o app:**
    ```bash
    npx expo start
    ```

---

## 🏗️ Gerando um APK Android

Siga este guia para construir um arquivo APK standalone que você pode instalar diretamente no seu dispositivo Android (sem passar pelo formato bundle da Play Store).

### 1. Instale a CLI do EAS
Se ainda não tiver, instale a ferramenta de build globalmente:

```bash
npm install -g eas-cli
```

### 2. Login e Configuração
Faça login na sua conta Expo e configure o projeto. Este comando criará ou atualizará o arquivo `eas.json`.

```bash
eas login
eas build:configure
```
> **Nota:** Responda **"All"** ou **"Android"** se perguntado sobre a plataforma.

### 3. Ajuste para gerar APK (Importante!) ⚠️
Por padrão, o perfil de "production" gera um `.aab` (App Bundle) para a Play Store. Para gerar um `.apk` instalável, você deve usar um perfil de **preview**.

Abra o arquivo `eas.json` e certifique-se de que a seção `preview` se parece com isso (especificamente o `buildType: "apk"`):

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 4. Rode o comando de Build
Agora, rode o comando especificando o perfil de `preview` e a plataforma `android`:

```bash
eas build -p android --profile preview
```

**O que acontece agora?**
- ☁️ O EAS vai subir seu código para a nuvem.
- ⚙️ O processo de build começará nos servidores da Expo.
- 📩 Assim que terminar, você receberá um link para baixar seu arquivo `.apk` diretamente.
