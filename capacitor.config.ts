import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skillswap.app',
  appName: 'SkillSwap',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Configuration de plugins si nécessaire
  }
};

export default config;