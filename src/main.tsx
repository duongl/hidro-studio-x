import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './utils/i18n.ts';
import { BackgroundQueueProvider } from './context/BackgroundQueueContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BackgroundQueueProvider>
        <App />
      </BackgroundQueueProvider>
    </LanguageProvider>
  </StrictMode>,
);
