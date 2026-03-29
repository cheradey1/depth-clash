import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.depthclash.game',
  appName: 'Depth Clash',
  webDir: 'dist',
  
  // Android specific configurations
  android: {
    allowMixedContent: true,
  },
  
  // Server configuration for development
  server: {
    androidScheme: 'https',
  },
  
  // Plugins configuration
  plugins: {
    // Add any plugin configurations here if needed
  }
};

export default config;
