/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Calculator,
  ClipboardList,
  Code2,
  Compass,
  Cpu,
  Download,
  FileCode,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  X,
} from 'lucide-react';
import { ParkingSimulator } from './components/ParkingSimulator';
import { CodeStudioTab, downloadArduinoSketch } from './components/CodeStudioTab';
import { SlideDeckStudio } from './components/SlideDeckStudio';
import { MasterPlanTab } from './components/MasterPlanTab';
import { InteractiveSchematic } from './components/InteractiveSchematic';
import { EngineeringCalculations } from './components/EngineeringCalculations';
import { BomAndAssembly } from './components/BomAndAssembly';
import { downloadSlidesPdf } from './lib/slidePdfExporter';

type DashboardTabId =
  | 'simulator'
  | 'code'
  | 'slides'
  | 'master-plan'
  | 'schematic'
  | 'calculations'
  | 'bom-qa';

interface NavTabItem {
  id: DashboardTabId;
  label: string;
  meta: string;
  sectionTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_TABS: NavTabItem[] = [
  {
    id: 'simulator',
    label: 'Live Simulator',
    meta: '3 Bays · 5s',
    sectionTitle: 'Interactive 3-Bay Hardware Bench & Sensor Sandbox',
    icon: Activity,
  },
  {
    id: 'code',
    label: 'C++ Code Studio',
    meta: 'Core C++',
    sectionTitle: 'KIE1004 Procedural Arduino C++ Firmware Studio',
    icon: Code2,
  },
  {
    id: 'slides',
    label: 'Presentation Slides',
    meta: '10 · .PDF',
    sectionTitle: 'Presentation Deck, Diagrams & Complete Speaker Scripts',
    icon: Presentation,
  },
  {
    id: 'master-plan',
    label: 'Master Plan',
    meta: 'Zero → Done',
    sectionTitle: 'Beginner Master Plan & Wire-by-Wire Circuit Assembly',
    icon: Compass,
  },
  {
    id: 'schematic',
    label: 'Schematic & Pins',
    meta: '20/20+0x24',
    sectionTitle: '20-Pin Arduino Uno + PCF8574 (0x24) 3-Buzzer Schematic',
    icon: Cpu,
  },
  {
    id: 'calculations',
    label: 'Math & Proofs',
    meta: 'LaTeX',
    sectionTitle: 'Electrical Budgets, Stationary FSM & Tariff Proofs',
    icon: Calculator,
  },
  {
    id: 'bom-qa',
    label: 'BOM, QA & Defense',
    meta: 'Editable',
    sectionTitle: 'Editable BOM Pricing, 10-Point QA, Rubric & Viva FAQ',
    icon: ClipboardList,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTabId>('simulator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const currentTabItem =
    NAV_TABS.find((t) => t.id === activeTab) ?? NAV_TABS[0];

  const selectTab = (id: DashboardTabId) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex bg-[#F4F6F9] text-[#202124] antialiased">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-menu-backdrop"
          className="fixed inset-0 z-40 bg-[#202124]/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Navigation Sidebar (Pinned Full Height — Collapsible Desktop + Mobile Drawer) */}
      <aside
        data-testid="dashboard-sidebar"
        aria-label="Primary dashboard navigation"
        className={`fixed inset-y-0 left-0 z-50 h-full bg-white border-r border-[#DADCE0] flex flex-col justify-between transition-all duration-150 lg:static lg:translate-x-0 shrink-0 ${
          mobileMenuOpen ? 'translate-x-0 w-[256px]' : '-translate-x-full w-[256px]'
        } ${sidebarCollapsed ? 'lg:w-[58px]' : 'lg:w-[248px]'}`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Brand Header + Collapse Control */}
          <div
            className={`h-12 border-b border-[#DADCE0] flex items-center shrink-0 ${
              sidebarCollapsed ? 'lg:justify-center lg:px-1.5 px-4 justify-between' : 'px-3.5 justify-between'
            }`}
          >
            <div className={`min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <div className="text-[13px] font-medium text-[#202124] tracking-tight truncate">
                KIE1004 Smart Parking
              </div>
              <div className="text-[10px] font-mono text-[#1A73E8] truncate">
                REV v3.1 · UNO + 0x24
              </div>
            </div>

            {/* Desktop Collapse / Expand Button */}
            <button
              type="button"
              data-testid="toggle-sidebar-collapse"
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:inline-flex items-center justify-center p-1.5 text-[#5F6368] hover:text-[#202124] hover:bg-[#F4F6F9] cursor-pointer"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Drawer Close Button */}
            <button
              type="button"
              data-testid="close-mobile-menu"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden p-1.5 text-[#5F6368] hover:text-[#202124] hover:bg-[#F4F6F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab List */}
          <nav
            className="flex-1 p-2 space-y-0.5 overflow-y-auto dash-scroll min-h-0"
            aria-label="Dashboard sections"
          >
            {!sidebarCollapsed && (
              <div className="px-2.5 pt-1 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#5F6368]">
                Workspace Views
              </div>
            )}
            {NAV_TABS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`nav-tab-${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  onClick={() => selectTab(item.id)}
                  className={`w-full flex items-center gap-2 text-left text-xs transition-colors cursor-pointer border-l-2 ${
                    sidebarCollapsed
                      ? 'lg:justify-center lg:px-0 lg:py-2.5 justify-between px-2.5 py-2'
                      : 'justify-between px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-[#E8F0FE] border-l-[#1A73E8] text-[#174EA6] font-medium'
                      : 'border-l-transparent text-[#3C4043] font-normal hover:bg-[#F4F6F9] hover:text-[#202124]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'
                      }`}
                    />
                    <span className={`truncate whitespace-nowrap ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                      {item.label}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-[10px] shrink-0 ${
                      sidebarCollapsed ? 'lg:hidden' : ''
                    } ${isActive ? 'text-[#1A73E8]' : 'text-[#80868B]'}`}
                  >
                    {item.meta}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Compact Spec Footer inside Sidebar (hidden when collapsed on desktop) */}
        <div
          className={`p-3 border-t border-[#DADCE0] bg-[#F8F9FA] text-[10.5px] font-mono text-[#5F6368] space-y-1 shrink-0 ${
            sidebarCollapsed ? 'lg:hidden' : ''
          }`}
        >
          <div className="flex justify-between">
            <span>Sensors</span>
            <span className="text-[#202124]">3+1 HC-SR04</span>
          </div>
          <div className="flex justify-between">
            <span>Outputs</span>
            <span className="text-[#202124]">9 LED · 3 LCD · 3 BZ</span>
          </div>
          <div className="flex justify-between">
            <span>Assignment</span>
            <span className="text-[#1A73E8]">Sem 1 · 2026/27</span>
          </div>
          <div className="flex justify-between">
            <span>Default Kit</span>
            <span className="text-[#137333]">RM 76.70</span>
          </div>
        </div>
      </aside>

      {/* Main Content Shell (Pinned 100dvh, Inner Scroll Only) */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* Compact Top Material 3 App Bar */}
        <header className="h-12 bg-white border-b border-[#DADCE0] px-2.5 sm:px-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              data-testid="open-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 border border-[#DADCE0] text-[#202124] hover:bg-[#F4F6F9] cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono text-[#1A73E8] hidden md:inline shrink-0">
                {currentTabItem.label.toUpperCase()}
              </span>
              <span className="text-[#DADCE0] hidden md:inline" aria-hidden="true">
                /
              </span>
              <h1 className="text-[13px] sm:text-sm font-normal text-[#202124] truncate">
                {currentTabItem.sectionTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={downloadArduinoSketch}
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-normal border border-[#DADCE0] bg-white text-[#202124] hover:bg-[#F4F6F9] transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#1A73E8]" />
              <span className="hidden sm:inline">Download .ino</span>
              <span className="sm:hidden">.ino</span>
            </button>
            <button
              type="button"
              onClick={() => downloadSlidesPdf()}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-[#1A73E8] text-white hover:bg-[#1557B0] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Slides (.pdf)</span>
              <span className="sm:hidden">.PDF</span>
            </button>
          </div>
        </header>

        {/* Active Dashboard Viewport (Strict Internal Scroll — Zero Page Gap) */}
        <main className="flex-1 min-h-0 p-2.5 sm:p-4 overflow-hidden">
          {activeTab === 'simulator' && <ParkingSimulator />}
          {activeTab === 'code' && <CodeStudioTab />}
          {activeTab === 'slides' && <SlideDeckStudio />}
          {activeTab === 'master-plan' && <MasterPlanTab />}
          {activeTab === 'schematic' && <InteractiveSchematic />}
          {activeTab === 'calculations' && <EngineeringCalculations />}
          {activeTab === 'bom-qa' && <BomAndAssembly />}
        </main>
      </div>
    </div>
  );
}
