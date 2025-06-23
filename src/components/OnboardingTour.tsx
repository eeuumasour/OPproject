import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  adminOnly?: boolean;
  userOnly?: boolean;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: OnboardingStep[];
}

export function OnboardingTour({ isOpen, onClose, steps }: OnboardingTourProps) {
  const { currentUser } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Фильтруем шаги в зависимости от роли пользователя
  const filteredSteps = steps.filter(step => {
    if (step.adminOnly && currentUser?.role !== 'admin') return false;
    if (step.userOnly && currentUser?.role === 'admin') return false;
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && filteredSteps[currentStep]) {
      const element = document.querySelector(filteredSteps[currentStep].target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        // Убираем предыдущую подсветку
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
          el.classList.remove('onboarding-highlight');
          (el as HTMLElement).style.position = '';
          (el as HTMLElement).style.zIndex = '';
          (el as HTMLElement).style.boxShadow = '';
          (el as HTMLElement).style.borderRadius = '';
          (el as HTMLElement).style.pointerEvents = '';
        });

        // Блокируем все интерактивные элементы кроме текущего
        document.querySelectorAll('button, a, input, select, textarea').forEach(el => {
          if (!element.contains(el) && el !== element) {
            (el as HTMLElement).style.pointerEvents = 'none';
            (el as HTMLElement).style.opacity = '0.5';
          }
        });

        // Добавляем подсветку к текущему элементу
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('onboarding-highlight');
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.style.boxShadow = '0 0 0 4px rgba(182, 194, 252, 0.8), 0 0 20px rgba(182, 194, 252, 0.4)';
        element.style.borderRadius = '8px';
        element.style.pointerEvents = 'auto';
        element.style.opacity = '1';
      }
    }

    return () => {
      // Очистка при размонтировании
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
        (el as HTMLElement).style.position = '';
        (el as HTMLElement).style.zIndex = '';
        (el as HTMLElement).style.boxShadow = '';
        (el as HTMLElement).style.borderRadius = '';
        (el as HTMLElement).style.pointerEvents = '';
        (el as HTMLElement).style.opacity = '';
      });

      // Восстанавливаем все элементы
      document.querySelectorAll('button, a, input, select, textarea').forEach(el => {
        (el as HTMLElement).style.pointerEvents = '';
        (el as HTMLElement).style.opacity = '';
      });
    };
  }, [currentStep, isOpen, filteredSteps]);

  const nextStep = () => {
    if (filteredSteps[currentStep]?.action) {
      filteredSteps[currentStep].action!();
    }
    
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  // Вычисляем позицию окна относительно выделенного элемента
  const getModalPosition = () => {
    if (!targetElement) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const step = filteredSteps[currentStep];
    const modalWidth = isMobile ? 320 : 400;
    const modalHeight = 200;
    const padding = 20;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - modalHeight - padding;
        left = rect.left + (rect.width / 2) - (modalWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + (rect.width / 2) - (modalWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (modalHeight / 2);
        left = rect.left - modalWidth - padding;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (modalHeight / 2);
        left = rect.right + padding;
        break;
    }

    // Проверяем границы экрана
    const maxTop = window.innerHeight - modalHeight - padding;
    const maxLeft = window.innerWidth - modalWidth - padding;

    top = Math.max(padding, Math.min(top, maxTop));
    left = Math.max(padding, Math.min(left, maxLeft));

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  if (!isOpen || !filteredSteps[currentStep]) return null;

  const step = filteredSteps[currentStep];
  const progress = ((currentStep + 1) / filteredSteps.length) * 100;
  const modalPosition = getModalPosition();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-1000" />
      
      {/* Tour popup */}
      <div 
        className="z-1002 max-w-sm"
        style={{
          ...modalPosition,
          maxWidth: isMobile ? '90vw' : '400px',
          width: '100%'
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden onboarding-enter">
          {/* Header */}
          <div 
            className="p-4 text-white relative"
            style={{ background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold uppercase">{step.title}</h3>
                <div className="text-sm opacity-90 uppercase">
                  ШАГ {currentStep + 1} ИЗ {filteredSteps.length}
                  {currentUser?.role === 'admin' ? ' (АДМИНИСТРАТОР)' : ' (ПОЛЬЗОВАТЕЛЬ)'}
                </div>
              </div>
              <button
                onClick={skipTour}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="uppercase">НАЗАД</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={skipTour}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors uppercase"
                >
                  ПРОПУСТИТЬ
                </button>
                
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors uppercase"
                  style={{ backgroundColor: '#b6c2fc' }}
                >
                  {currentStep === filteredSteps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>ЗАВЕРШИТЬ</span>
                    </>
                  ) : (
                    <>
                      <span>ДАЛЕЕ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Хук для управления онбордингом
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('planify-onboarding-seen');
    if (!seen) {
      // Запускаем обучение при первом входе
      setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 1000);
    } else {
      setHasSeenOnboarding(true);
    }
  }, []);

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    setHasSeenOnboarding(true);
    localStorage.setItem('planify-onboarding-seen', 'true');
  };

  return {
    isOnboardingOpen,
    hasSeenOnboarding,
    startOnboarding,
    completeOnboarding,
  };
}