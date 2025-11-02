import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ServerProfile from './server-settings/ServerProfile';
import Engagement from './server-settings/Engagement';
import Emojis from './server-settings/Emojis';
import Members from './server-settings/Members';
import Roles from './server-settings/Roles';
import InvitesAccess from './server-settings/InvitesAccess';
import SafetySettings from './server-settings/SafetySettings';
import AuditLog from './server-settings/AuditLog';
import Bans from './server-settings/Bans';
import AutoMod from './server-settings/AutoMod';
import EnableCommunity from './server-settings/EnableCommunity';
import ServerSubscriptions from './server-settings/ServerSubscriptions';
import Rooms from './server-settings/Rooms';
import PaidAccess from './server-settings/PaidAccess';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
}

type SettingsSection =
  | 'server-profile'
  | 'engagement'
  | 'emojis'
  | 'members'
  | 'roles'
  | 'invites-access'
  | 'safety-settings'
  | 'audit-log'
  | 'bans'
  | 'automod'
  | 'enable-community'
  | 'server-subscriptions'
  | 'rooms'
  | 'paid-access';

const ServerSettingsModal = ({ isOpen, onClose, initialSection }: ServerSettingsModalProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection || 'server-profile');
  useEffect(() => { if (isOpen && initialSection) setActiveSection(initialSection); }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'server-profile':
        return <ServerProfile/>;
      case 'engagement':
        return <Engagement/>;
      case 'emojis':
        return <Emojis/>;
      case 'members':
        return <Members/>;
      case 'roles':
        return <Roles/>;
      case 'invites-access':
        return <InvitesAccess/>;
      case 'safety-settings':
        return <SafetySettings/>;
      case 'audit-log':
        return <AuditLog/>;
      case 'bans':
        return <Bans/>;
      case 'automod':
        return <AutoMod/>;
      case 'enable-community':
        return <EnableCommunity/>;
      case 'server-subscriptions':
        return <ServerSubscriptions/>;
      case 'rooms':
        return <Rooms/>;
      case 'paid-access':
        return <PaidAccess/>;
      default:
        return null;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative inline-flex items-center w-[1280px] h-[713px]">
        {/* Left Sidebar */}
        <div className="flex flex-col w-64 h-[713px] py-6 px-4 gap-4 border-t border-b border-l border-[#181B22] rounded-l-3xl custom-bg-blur">
          <div className="flex items-center gap-3 self-stretch">
            <span className="text-xs font-bold text-purple">Server</span>
          </div>

          {/* Server Profile */}
          <button
            onClick={() => setActiveSection('server-profile')}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'server-profile' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.48131 12.9013C4.30234 13.6033 1.21114 15.0368 3.09389 16.8305C4.01359 17.7067 5.03791 18.3333 6.32573 18.3333H13.6743C14.9621 18.3333 15.9864 17.7067 16.9061 16.8305C18.7888 15.0368 15.6977 13.6033 14.5187 12.9013C11.754 11.2551 8.24599 11.2551 5.48131 12.9013Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.75 5.41666C13.75 7.48773 12.0711 9.16666 10 9.16666C7.92893 9.16666 6.25 7.48773 6.25 5.41666C6.25 3.3456 7.92893 1.66666 10 1.66666C12.0711 1.66666 13.75 3.3456 13.75 5.41666Z" stroke="white" strokeWidth="1.5"/>
            </svg>
            <span className="text-[15px] font-bold text-white">Server Profile</span>
          </button>

          {/* Paid Content (Engagement) */}
          <button
            onClick={() => setActiveSection('engagement')}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'engagement' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.91699 7.91666V15.4167C2.91699 15.8049 2.91699 15.9991 2.98043 16.1522C3.065 16.3564 3.22723 16.5187 3.43143 16.6032C3.58457 16.6667 3.77871 16.6667 4.16699 16.6667C4.55528 16.6667 4.74942 16.6667 4.90256 16.6032C5.10675 16.5187 5.26898 16.3564 5.35356 16.1522C5.41699 15.9991 5.41699 15.8049 5.41699 15.4167V7.91666C5.41699 7.52838 5.41699 7.33424 5.35356 7.1811C5.26898 6.97691 5.10675 6.81467 4.90256 6.7301C4.74942 6.66666 4.55528 6.66666 4.16699 6.66666C3.77871 6.66666 3.58457 6.66666 3.43143 6.7301C3.22723 6.81467 3.065 6.97691 2.98043 7.1811C2.91699 7.33424 2.91699 7.52838 2.91699 7.91666Z" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M8.75 4.58334V15.4163C8.75 15.8045 8.75 15.9987 8.81342 16.1518C8.898 16.356 9.06025 16.5183 9.26442 16.6028C9.41758 16.6663 9.61175 16.6663 10 16.6663C10.3882 16.6663 10.5824 16.6663 10.7356 16.6028C10.9397 16.5183 11.102 16.356 11.1866 16.1518C11.25 15.9987 11.25 15.8045 11.25 15.4163V4.58334C11.25 4.19505 11.25 4.00091 11.1866 3.84777C11.102 3.64358 10.9397 3.48134 10.7356 3.39677C10.5824 3.33334 10.3882 3.33334 10 3.33334C9.61175 3.33334 9.41758 3.33334 9.26442 3.39677C9.06025 3.48134 8.898 3.64358 8.81342 3.84777C8.75 4.00091 8.75 4.19505 8.75 4.58334Z" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M14.583 10.4167V15.4167C14.583 15.8049 14.583 15.9991 14.6464 16.1522C14.731 16.3564 14.8933 16.5187 15.0974 16.6032C15.2506 16.6667 15.4448 16.6667 15.833 16.6667C16.2213 16.6667 16.4154 16.6667 16.5686 16.6032C16.7728 16.5187 16.935 16.3564 17.0196 16.1522C17.083 15.9991 17.083 15.8049 17.083 15.4167V10.4167C17.083 10.0284 17.083 9.83425 17.0196 9.68108C16.935 9.47691 16.7728 9.31466 16.5686 9.23008C16.4154 9.16666 16.2213 9.16666 15.833 9.16666C15.4448 9.16666 15.2506 9.16666 15.0974 9.23008C14.8933 9.31466 14.731 9.47691 14.6464 9.68108C14.583 9.83425 14.583 10.0284 14.583 10.4167Z" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            <span className="text-[15px] font-bold text-white">Paid Content</span>
          </button>

          <div className="h-px self-stretch bg-[#181B22]" />


          {/* People Section */}
          <div className="flex flex-col items-start gap-3 self-stretch">
            <div className="flex items-center gap-3 self-stretch">
              <span className="text-xs font-bold text-purple">People</span>
            </div>
            <button
              onClick={() => setActiveSection('emojis')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'emojis' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.2192 3.32846C13.9844 1.95769 12.034 2.51009 10.8623 3.39001C10.3818 3.7508 10.1417 3.93119 10.0003 3.93119C9.85899 3.93119 9.61882 3.7508 9.13832 3.39001C7.96667 2.51009 6.01623 1.95769 3.78152 3.32846C0.848716 5.12745 0.185092 11.0624 6.94993 16.0695C8.23842 17.0232 8.88266 17.5 10.0003 17.5C11.118 17.5 11.7622 17.0232 13.0507 16.0695C19.8156 11.0624 19.1519 5.12745 16.2192 3.32846Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Emojis</span>
            </button>
            <button
              onClick={() => setActiveSection('members')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'members' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5137 16.6667H15.9222C16.8804 16.6667 17.6426 16.2301 18.3269 15.6197C20.0653 14.0688 15.9787 12.5 14.5837 12.5M12.917 4.22397C13.1062 4.18644 13.3027 4.16666 13.5043 4.16666C15.0209 4.16666 16.2503 5.28596 16.2503 6.66666C16.2503 8.04737 15.0209 9.16666 13.5043 9.16666C13.3027 9.16666 13.1062 9.14691 12.917 9.10933" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3.73443 13.426C2.75195 13.9525 0.175949 15.0276 1.7449 16.3728C2.51133 17.03 3.36493 17.5 4.4381 17.5H10.5619C11.6351 17.5 12.4887 17.03 13.2551 16.3728C14.8241 15.0276 12.2481 13.9525 11.2656 13.426C8.96167 12.1913 6.03833 12.1913 3.73443 13.426Z" stroke="white" strokeWidth="1.5"/>
                <path d="M10.8337 6.25C10.8337 8.09095 9.34124 9.58333 7.50033 9.58333C5.65938 9.58333 4.16699 8.09095 4.16699 6.25C4.16699 4.40905 5.65938 2.91666 7.50033 2.91666C9.34124 2.91666 10.8337 4.40905 10.8337 6.25Z" stroke="white" strokeWidth="1.5"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Members</span>
            </button>
            <button
              onClick={() => setActiveSection('roles')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'roles' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6663 18.3335V14.1668C16.6663 12.5955 16.6663 11.8098 16.1782 11.3217C15.69 10.8335 14.9043 10.8335 13.333 10.8335L9.99967 18.3335L6.66634 10.8335C5.09499 10.8335 4.30932 10.8335 3.82117 11.3217C3.33301 11.8098 3.33301 12.5955 3.33301 14.1668V18.3335" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.0003 12.5L9.58366 15.8333L10.0003 17.0833L10.417 15.8333L10.0003 12.5ZM10.0003 12.5L9.16699 10.8333H10.8337L10.0003 12.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.9163 5.41676V4.58343C12.9163 2.97261 11.6105 1.66676 9.99967 1.66676C8.38884 1.66676 7.08301 2.97261 7.08301 4.58343V5.41676C7.08301 7.0276 8.38884 8.33341 9.99967 8.33341C11.6105 8.33341 12.9163 7.0276 12.9163 5.41676Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Roles</span>
            </button>
            <button
              onClick={() => setActiveSection('rooms')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'rooms' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33301 6.66667C3.33301 5.74619 3.33301 5.28595 3.50835 4.943C3.66116 4.64405 3.89472 4.41049 4.19367 4.25767C4.53663 4.08234 4.99686 4.08234 5.91734 4.08234H14.083C15.0035 4.08234 15.4638 4.08234 15.8067 4.25767C16.1057 4.41049 16.3392 4.64405 16.492 4.943C16.6673 5.28595 16.6673 5.74619 16.6673 6.66667V15.8333C16.6673 16.7538 16.6673 17.214 16.492 17.557C16.3392 17.8559 16.1057 18.0895 15.8067 18.2423C15.4638 18.4177 15.0035 18.4177 14.083 18.4177H5.91734C4.99686 18.4177 4.53663 18.4177 4.19367 18.2423C3.89472 18.0895 3.66116 17.8559 3.50835 17.557C3.33301 17.214 3.33301 16.7538 3.33301 15.8333V6.66667Z" stroke="white" strokeWidth="1.5"/>
                <path d="M8.33301 6.66667H11.6663" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 10H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 13.3333H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Rooms</span>
            </button>
            <button
              onClick={() => setActiveSection('invites-access')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'invites-access' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3337 9.16666C18.3337 8.75716 18.3293 8.34766 18.3205 7.93699C18.2661 5.38238 18.2388 4.10507 17.2962 3.15888C16.3536 2.21269 15.0418 2.17973 12.418 2.1138C10.8009 2.07317 9.19975 2.07317 7.58268 2.1138C4.95893 2.17971 3.64706 2.21267 2.70445 3.15887C1.76184 4.10506 1.73461 5.38237 1.68013 7.93698C1.66261 8.75841 1.66262 9.57491 1.68013 10.3963C1.73461 12.951 1.76185 14.2282 2.70446 15.1745C3.64706 16.1207 4.95893 16.1536 7.58268 16.2195C8.39125 16.2398 9.19575 16.25 10.0003 16.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.83301 6.25L8.28469 7.69953C9.71402 8.54458 10.2853 8.54458 11.7147 7.69953L14.1664 6.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.9163 12.0833C15.6778 12.0833 17.9163 9.84474 17.9163 7.08333C17.9163 4.3219 15.6778 2.08333 12.9163 2.08333C10.1549 2.08333 7.91634 4.3219 7.91634 7.08333C7.91634 7.817 8.07436 8.51374 8.35826 9.14141L2.08301 15.4167V17.9167H4.58301V16.25H6.24967V14.5833H7.91634L10.8583 11.6414C11.4859 11.9253 12.1827 12.0833 12.9163 12.0833Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.5833 5.41667L13.75 6.25001" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Invites & Access</span>
            </button>
          </div>

          <div className="h-px self-stretch bg-[#181B22]" />

          {/* Moderation Section */}
          <div className="flex flex-col items-start gap-3 self-stretch">
            <div className="flex items-center gap-3 self-stretch">
              <span className="text-xs font-bold text-purple">Moderation</span>
            </div>
            <button
              onClick={() => setActiveSection('safety-settings')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'safety-settings' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 9.31941V6.90023C17.5 5.53356 17.5 4.85022 17.1632 4.4044C16.8265 3.95856 16.0651 3.74212 14.5423 3.30924C13.5018 3.01349 12.5847 2.65718 11.8519 2.3319C10.8528 1.88841 10.3533 1.66666 10 1.66666C9.64667 1.66666 9.14717 1.88841 8.14809 2.3319C7.41532 2.65718 6.4982 3.01348 5.45778 3.30924C3.93494 3.74212 3.17352 3.95856 2.83676 4.4044C2.5 4.85022 2.5 5.53356 2.5 6.90023V9.31941C2.5 14.0071 6.71897 16.8196 8.82833 17.9328C9.33425 18.1998 9.58717 18.3333 10 18.3333C10.4128 18.3333 10.6657 18.1998 11.1717 17.9328C13.281 16.8196 17.5 14.0071 17.5 9.31941Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Safety Settings</span>
            </button>
            <button
              onClick={() => setActiveSection('audit-log')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'audit-log' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.333 5.00001H15.833C16.054 5.00001 16.266 5.08781 16.4223 5.24409C16.5785 5.40037 16.6663 5.61233 16.6663 5.83334V15C16.6663 15.442 16.4907 15.866 16.1782 16.1785C15.8656 16.4911 15.4417 16.6667 14.9997 16.6667M14.9997 16.6667C14.5576 16.6667 14.1337 16.4911 13.8212 16.1785C13.5086 15.866 13.333 15.442 13.333 15V4.16668C13.333 3.94566 13.2452 3.7337 13.0889 3.57742C12.9326 3.42114 12.7207 3.33334 12.4997 3.33334H4.16634C3.94533 3.33334 3.73337 3.42114 3.57709 3.57742C3.42081 3.7337 3.33301 3.94566 3.33301 4.16668V14.1667C3.33301 14.8297 3.5964 15.4656 4.06524 15.9344C4.53408 16.4033 5.16997 16.6667 5.83301 16.6667H14.9997Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66699 6.66666H10.0003" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66699 10H10.0003" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66699 13.3333H10.0003" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Audit Log</span>
            </button>
            <button
              onClick={() => setActiveSection('bans')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'bans' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.375 4.16666L16.0417 15.8333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5417 9.99999C18.5417 5.39761 14.8107 1.66666 10.2083 1.66666C5.60596 1.66666 1.875 5.39761 1.875 9.99999C1.875 14.6023 5.60596 18.3333 10.2083 18.3333C14.8107 18.3333 18.5417 14.6023 18.5417 9.99999Z" stroke="white" strokeWidth="1.5"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Bans</span>
            </button>
            <button
              onClick={() => setActiveSection('automod')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${activeSection === 'automod' ? 'bg-purple/20 text-white' : 'text-white hover:bg-white/5'}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3.33332V1.66666" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.8337 18.3333C15.8337 15.1117 13.222 12.5 10.0003 12.5C6.77867 12.5 4.16699 15.1117 4.16699 18.3333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.91699 6.25H7.92531M12.0753 6.25H12.0837" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.58301 5.55557C4.58301 5.03892 4.58301 4.78059 4.6398 4.56864C4.79391 3.99349 5.24316 3.54424 5.81831 3.39014C6.03025 3.33334 6.28858 3.33334 6.80523 3.33334H13.1941C13.7108 3.33334 13.9691 3.33334 14.181 3.39014C14.7562 3.54424 15.2054 3.99349 15.3596 4.56864C15.4163 4.78059 15.4163 5.03892 15.4163 5.55557C15.4163 6.58887 15.4163 7.10552 15.3028 7.52941C14.9945 8.67968 14.096 9.57818 12.9458 9.88643C12.5218 10 12.0052 10 10.9719 10H9.02742C7.99415 10 7.4775 10 7.05361 9.88643C5.90331 9.57818 5.00482 8.67968 4.69659 7.52941C4.58301 7.10552 4.58301 6.58887 4.58301 5.55557Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">AutoMod</span>
            </button>
          </div>

          <div className="h-px self-stretch bg-[#181B22]" />

          {/* Additional Options */}
          <div className="flex flex-col items-start gap-3 self-stretch"></div>

          <div className="h-px self-stretch bg-[#181B22]" />

          {/* Delete Server */}
          <div className="flex flex-col items-start gap-3 self-stretch">
            <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.25 4.58334L15.7336 12.9376C15.6016 15.072 15.5357 16.1393 15.0007 16.9066C14.7361 17.2859 14.3956 17.6061 14.0006 17.8467C13.2017 18.3333 12.1325 18.3333 9.99392 18.3333C7.8526 18.3333 6.78192 18.3333 5.98254 17.8458C5.58733 17.6048 5.24667 17.284 4.98223 16.904C4.4474 16.1355 4.38287 15.0668 4.25384 12.9293L3.75 4.58334" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2.5 4.58332H17.5M13.3797 4.58332L12.8109 3.40977C12.433 2.63021 12.244 2.24042 11.9181 1.99733C11.8458 1.94341 11.7693 1.89544 11.6892 1.85391C11.3283 1.66666 10.8951 1.66666 10.0287 1.66666C9.14067 1.66666 8.69667 1.66666 8.32973 1.86176C8.24842 1.905 8.17082 1.95491 8.09774 2.01096C7.76803 2.26391 7.58386 2.66795 7.21551 3.47604L6.71077 4.58332" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7.91699 13.75V8.75" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12.083 13.75V8.75" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[15px] font-bold text-red">Delete Server</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-col w-[1024px] h-[713px] justify-start items-center overflow-y-auto scrollbar border-t border-r border-b border-[#181B22] rounded-r-3xl py-6 custom-bg-blur">
          {renderContent()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ServerSettingsModal;
