import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { UserManagement } from './components/UserManagement';
import { Analytics } from './components/Analytics';
import { ProfileModal } from './components/ProfileModal';
import { TaskModal } from './components/TaskModal';
import { ManualPage } from './components/ManualPage';
import { OnboardingTour, useOnboarding } from './components/OnboardingTour';

function AppContent() {
  const { isAuthenticated, setLastView, getLastView, currentUser } = useApp();
  const [currentView, setCurrentView] = useState<'board' | 'calendar' | 'users' | 'analytics' | 'profile' | 'manual'>('board');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isOnboardingOpen, completeOnboarding } = useOnboarding();

  // Восстановление последнего представления при загрузке
  useEffect(() => {
    if (isAuthenticated) {
      const lastView = getLastView();
      if (lastView && ['board', 'calendar', 'users', 'analytics', 'profile', 'manual'].includes(lastView)) {
        setCurrentView(lastView as any);
      }
    }
  }, [isAuthenticated, getLastView]);

  // Сохранение текущего представления
  const handleViewChange = (view: 'board' | 'calendar' | 'users' | 'analytics' | 'profile' | 'manual') => {
    setCurrentView(view);
    setLastView(view);
  };

  // Шаги онбординга для администраторов
  const adminOnboardingSteps = [
    {
      id: 'welcome',
      title: 'Добро пожаловать, Администратор!',
      description: 'Вы вошли как администратор. У вас есть полный доступ ко всем функциям Planify. Давайте познакомимся с возможностями администратора.',
      target: 'body',
      position: 'bottom' as const,
    },
    {
      id: 'create-task',
      title: 'Создание задач',
      description: 'Как администратор, вы можете создавать задачи, назначать их пользователям, добавлять комментарии и управлять всеми аспектами проекта.',
      target: '[data-tour="create-task"]',
      position: 'bottom' as const,
      action: () => setShowCreateModal(true),
    },
    {
      id: 'board-selector',
      title: 'Управление досками',
      description: 'Администраторы могут создавать новые доски, редактировать их названия, удалять доски и делиться ссылками с командой.',
      target: '[data-tour="board-selector"]',
      position: 'bottom' as const,
    },
    {
      id: 'navigation',
      title: 'Административная навигация',
      description: 'У вас есть доступ ко всем разделам: доска, календарь, аналитика, управление пользователями и руководство.',
      target: '[data-tour="navigation"]',
      position: 'bottom' as const,
    },
    {
      id: 'users-management',
      title: 'Управление пользователями',
      description: 'Только администраторы могут добавлять пользователей в доски, изменять их роли и управлять правами доступа.',
      target: '[data-tour="navigation"] button:nth-child(4)',
      position: 'bottom' as const,
      adminOnly: true,
    },
    {
      id: 'kanban-columns',
      title: 'Kanban доска',
      description: 'Перетаскивайте задачи между колонками. Как администратор, вы можете редактировать любые задачи и добавлять комментарии.',
      target: '[data-tour="kanban-columns"]',
      position: 'top' as const,
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      description: 'Здесь отображаются уведомления о новых задачах, изменениях и других важных событиях в ваших досках.',
      target: '[data-tour="notifications"]',
      position: 'bottom' as const,
    },
    {
      id: 'profile',
      title: 'Профиль администратора',
      description: 'В профиле вы можете изменить свои данные, просмотреть статистику и управлять настройками аккаунта.',
      target: '[data-tour="profile"]',
      position: 'bottom' as const,
    },
  ];

  // Шаги онбординга для обычных пользователей
  const userOnboardingSteps = [
    {
      id: 'welcome',
      title: 'Добро пожаловать в Planify!',
      description: 'Это профессиональное приложение для управления задачами. Давайте познакомимся с основными функциями для пользователей.',
      target: 'body',
      position: 'bottom' as const,
    },
    {
      id: 'create-task',
      title: 'Создание задач',
      description: 'Вы можете создавать новые задачи, устанавливать приоритеты и сроки выполнения. Задачи можно назначать себе и другим участникам.',
      target: '[data-tour="create-task"]',
      position: 'bottom' as const,
      action: () => setShowCreateModal(true),
    },
    {
      id: 'board-selector',
      title: 'Переключение досок',
      description: 'Здесь вы можете переключаться между досками, к которым у вас есть доступ, и создавать новые доски.',
      target: '[data-tour="board-selector"]',
      position: 'bottom' as const,
    },
    {
      id: 'navigation',
      title: 'Навигация',
      description: 'Используйте эти вкладки для перехода между разными разделами: доска, календарь, аналитика и руководство.',
      target: '[data-tour="navigation"]',
      position: 'bottom' as const,
    },
    {
      id: 'kanban-columns',
      title: 'Работа с задачами',
      description: 'Перетаскивайте свои задачи между колонками для изменения их статуса. Задачи автоматически сортируются по приоритету.',
      target: '[data-tour="kanban-columns"]',
      position: 'top' as const,
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      description: 'Здесь отображаются уведомления о назначенных вам задачах, изменениях и других важных событиях.',
      target: '[data-tour="notifications"]',
      position: 'bottom' as const,
    },
    {
      id: 'profile',
      title: 'Ваш профиль',
      description: 'Нажмите на аватар, чтобы открыть настройки профиля, просмотреть свою статистику или выйти из системы.',
      target: '[data-tour="profile"]',
      position: 'bottom' as const,
    },
  ];

  // Выбираем шаги в зависимости от роли пользователя
  const onboardingSteps = currentUser?.role === 'admin' ? adminOnboardingSteps : userOnboardingSteps;

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (currentView === 'manual') {
    return <ManualPage onClose={() => handleViewChange('board')} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <KanbanBoard />;
      case 'calendar':
        return <CalendarView />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <div className="p-6"><ProfileModal isOpen={true} onClose={() => handleViewChange('board')} /></div>;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        onCreateTask={() => setShowCreateModal(true)}
      />
      
      <main className="h-[calc(100vh-120px)]" data-tour="kanban-columns">
        {renderView()}
      </main>

      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Онбординг тур */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={completeOnboarding}
        steps={onboardingSteps}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;