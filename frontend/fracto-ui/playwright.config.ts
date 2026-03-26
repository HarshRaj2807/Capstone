import { defineConfig } from '@playwright/test';
import * as path from 'path';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    headless: true
  },
  reporter: [['list']],
  webServer: [
    {
      command: 'dotnet run --project backend/Fracto.Api/Fracto.Api.csproj --launch-profile http',
      url: 'http://127.0.0.1:5104',
      timeout: 120000,
      reuseExistingServer: true,
      cwd: path.resolve(__dirname, '..', '..')
    },
    {
      command: 'npm start -- --host 127.0.0.1 --port 4200',
      url: 'http://127.0.0.1:4200',
      timeout: 120000,
      reuseExistingServer: true,
      cwd: path.resolve(__dirname)
    }
  ]
});
